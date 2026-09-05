'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEOC } from '@/context/EOCContext';
import { RiskZone, Village, Incident, Sensor, Road, FieldReport } from '@/types';
import { MOCK_GIS_RISK_ZONES, MOCK_GIS_VILLAGES } from '@/data/mockRiskZones';
import { MOCK_ROADS, MOCK_SENSORS, MOCK_INCIDENTS, MOCK_FIELD_REPORTS } from '@/data/mockData';
import { BASE_TILES, BaseTileKey } from '@/services/map/tileService';
import { NER_CENTER, STATE_CENTERS } from '@/services/map/geoService';
import {
  createRiskZoneIcon,
  createIncidentIcon,
  createSensorIcon,
  createVillageIcon,
  createFieldReportIcon,
  createGeolocationIcon,
  getRiskColor,
} from '@/services/map/markerService';
import { MapControls } from './MapControls';
import { MapLayerSelector, LayerToggleState } from './MapLayerSelector';
import { MapLegend } from './MapLegend';

interface LandslideMapProps {
  heightClass?: string;
  showControls?: boolean;
  onZoneClick?: (zone: RiskZone) => void;
}

export function LandslideMap({
  heightClass = 'h-[540px]',
  showControls = true,
  onZoneClick,
}: LandslideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBaseTile, setActiveBaseTile] = useState<BaseTileKey>('dark');
  const [isLocating, setIsLocating] = useState(false);

  // 7 Map Layers state
  const [layers, setLayers] = useState<LayerToggleState>({
    heatmap: true,
    riskZones: true,
    roads: true,
    villages: true,
    sensors: true,
    incidents: true,
    fieldReports: true,
  });

  const {
    riskZones,
    selectedZone,
    setSelectedZone,
    selectedState,
    riskFilter,
  } = useEOC();

  const handleToggleLayer = (key: keyof LayerToggleState) => {
    setLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 1. Initialize Map
  useEffect(() => {
    let isMounted = true;

    const initLeafletMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      const L = (await import('leaflet')).default;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [NER_CENTER.lat, NER_CENTER.lng],
          zoom: NER_CENTER.zoom,
          zoomControl: false,
          attributionControl: true,
        });

        // Add zoom control top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Tile layers
        const tileDark = L.tileLayer(BASE_TILES.dark.url, {
          attribution: BASE_TILES.dark.attribution,
          maxZoom: BASE_TILES.dark.maxZoom,
          subdomains: BASE_TILES.dark.subdomains,
        });

        const tileSatellite = L.tileLayer(BASE_TILES.satellite.url, {
          attribution: BASE_TILES.satellite.attribution,
          maxZoom: BASE_TILES.satellite.maxZoom,
        });

        const tileTerrain = L.tileLayer(BASE_TILES.terrain.url, {
          attribution: BASE_TILES.terrain.attribution,
          maxZoom: BASE_TILES.terrain.maxZoom,
        });

        tileDark.addTo(map);

        // Layer Groups
        const groups = {
          heatmap: L.layerGroup().addTo(map),
          riskZones: L.layerGroup().addTo(map),
          roads: L.layerGroup().addTo(map),
          villages: L.layerGroup().addTo(map),
          sensors: L.layerGroup().addTo(map),
          incidents: L.layerGroup().addTo(map),
          fieldReports: L.layerGroup().addTo(map),
          userLocation: L.layerGroup().addTo(map),
        };

        mapInstanceRef.current = {
          map,
          L,
          tiles: { dark: tileDark, satellite: tileSatellite, terrain: tileTerrain },
          groups,
        };
      }
    };

    initLeafletMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Tile layer switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map, tiles } = mapInstanceRef.current;
    Object.values(tiles).forEach((t: any) => map.removeLayer(t));

    if (activeBaseTile === 'dark') tiles.dark.addTo(map);
    else if (activeBaseTile === 'satellite') tiles.satellite.addTo(map);
    else if (activeBaseTile === 'terrain') tiles.terrain.addTo(map);
  }, [activeBaseTile]);

  // 3. React to State Filter changes (Auto fly-to center)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map } = mapInstanceRef.current;
    const target = STATE_CENTERS[selectedState] || STATE_CENTERS['All NER'];
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
  }, [selectedState]);

  // 4. Render All 7 Layers
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const { map, L, groups } = mapInstanceRef.current;

    // Clear all layer groups
    groups.heatmap.clearLayers();
    groups.riskZones.clearLayers();
    groups.roads.clearLayers();
    groups.villages.clearLayers();
    groups.sensors.clearLayers();
    groups.incidents.clearLayers();
    groups.fieldReports.clearLayers();

    // Active zones pool
    const activeRiskZones = MOCK_GIS_RISK_ZONES.filter((z) => {
      const matchState = selectedState === 'All NER' || z.state === selectedState;
      const matchRisk = riskFilter === 'ALL' || z.riskLevel === riskFilter;
      return matchState && matchRisk;
    });

    // LAYER 1: Risk Heatmap (Multi-ring radial gradient circles that make critical zones glow)
    if (layers.heatmap) {
      activeRiskZones.forEach((z) => {
        const { bg, level } = getRiskColor(z.riskScore);
        const isCrit = level === 'CRITICAL';
        const isHigh = level === 'HIGH';

        const outerRadius = isCrit ? 12000 : isHigh ? 8000 : 5000;
        const midRadius = isCrit ? 7000 : isHigh ? 4500 : 2500;
        const coreRadius = isCrit ? 3000 : isHigh ? 2000 : 1000;

        // Outer halo
        L.circle([z.lat, z.lng], {
          radius: outerRadius,
          color: bg,
          weight: 0,
          fillColor: bg,
          fillOpacity: isCrit ? 0.15 : 0.08,
          interactive: false,
        }).addTo(groups.heatmap);

        // Mid intensity ring
        L.circle([z.lat, z.lng], {
          radius: midRadius,
          color: bg,
          weight: 0,
          fillColor: bg,
          fillOpacity: isCrit ? 0.3 : 0.18,
          interactive: false,
        }).addTo(groups.heatmap);

        // Core hotspot
        const coreCircle = L.circle([z.lat, z.lng], {
          radius: coreRadius,
          color: bg,
          weight: isCrit ? 1.5 : 1,
          dashArray: isCrit ? '3, 3' : undefined,
          fillColor: bg,
          fillOpacity: isCrit ? 0.45 : 0.28,
        });

        coreCircle.bindTooltip(
          `<div style="font-family: Inter, sans-serif; font-size: 11px;">
            <b>${z.name}</b><br/>
            Hazard Heat Index: <span style="color: ${bg}; font-weight: bold;">${z.riskScore}/100</span>
          </div>`,
          { direction: 'top' }
        );

        coreCircle.addTo(groups.heatmap);
      });
    }

    // LAYER 2: Risk Zones Markers
    if (layers.riskZones) {
      activeRiskZones.forEach((z) => {
        const isSelected = selectedZone?.id === z.id;
        const icon = createRiskZoneIcon(L, z.riskScore, isSelected);
        const marker = L.marker([z.lat, z.lng], { icon });

        // Build rich interactive popup
        const { bg, level } = getRiskColor(z.riskScore);
        const popupContent = `
          <div style="font-family: Inter, sans-serif; min-width: 240px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${bg}; color: #ffffff; text-transform: uppercase;">
                ${z.riskLevel} (${z.riskScore}/100)
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #94a3b8;">${z.id}</span>
            </div>

            <h4 style="font-size: 13px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0;">${z.name}</h4>
            <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 8px;">
              <b>District:</b> ${z.district}, ${z.state}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px; background: #080c14; padding: 6px; border-radius: 6px; border: 1px solid #1e2f4a; margin-bottom: 8px;">
              <div><span style="color: #64748b;">24h Rain:</span> <b style="color: #38bdf8;">${z.rainfall24h} mm</b></div>
              <div><span style="color: #64748b;">Soil Sat:</span> <b style="color: #f97316;">${z.soilMoisture}%</b></div>
              <div><span style="color: #64748b;">Slope:</span> <b style="color: #e2e8f0;">${z.slope}°</b></div>
              <div><span style="color: #64748b;">Exposed Pop:</span> <b style="color: #a855f7;">${z.populationExposed.toLocaleString()}</b></div>
            </div>

            <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">
              <b>Nearest Lifeline:</b> ${z.nearestRoad} (${z.nearestRoadDistanceKm} km)
            </div>

            <button
              id="btn-view-details-${z.id}"
              style="
                width: 100%;
                background: #0284c7;
                color: #ffffff;
                font-weight: bold;
                font-size: 11px;
                padding: 6px 10px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                box-shadow: 0 2px 6px rgba(2, 132, 199, 0.4);
              "
            >
              View Details →
            </button>
          </div>
        `;

        marker.bindPopup(popupContent, { minWidth: 240 });

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-view-details-${z.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              setSelectedZone(z);
              if (onZoneClick) onZoneClick(z);
              marker.closePopup();
            };
          }
        });

        marker.on('click', () => {
          setSelectedZone(z);
          if (onZoneClick) onZoneClick(z);
        });

        marker.addTo(groups.riskZones);
      });
    }

    // LAYER 3: Roads & Lifelines
    if (layers.roads) {
      MOCK_ROADS.forEach((rd) => {
        rd.criticalChokepoints.forEach((cp) => {
          const isBlocked = cp.status === 'Completely Blocked';
          const roadIcon = L.divIcon({
            className: 'custom-road-marker',
            html: `
              <div style="
                background: ${isBlocked ? '#dc2626' : '#d97706'};
                color: #ffffff;
                padding: 3px 6px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                border: 1.5px solid #ffffff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.8);
                white-space: nowrap;
                cursor: pointer;
              ">
                🚧 ${rd.name}: ${isBlocked ? 'BLOCKED' : 'PARTIAL'}
              </div>
            `,
            iconSize: [85, 22],
            iconAnchor: [42, 11],
          });

          const roadMarker = L.marker([cp.lat, cp.lng], { icon: roadIcon });
          roadMarker.bindPopup(`
            <div style="font-family: Inter, sans-serif; padding: 4px;">
              <h4 style="font-size: 12px; font-weight: bold; color: #f87171; margin-bottom: 2px;">
                ${rd.name}: ${cp.locationName}
              </h4>
              <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 4px;">
                Route: <b>${rd.route}</b> (Chainage Km ${cp.chainageKm})
              </div>
              <div style="font-size: 11px; color: #f59e0b; margin-bottom: 4px;">
                Status: <b>${cp.status}</b> • ETA: <b>${cp.estimatedClearanceEta || 'In Progress'}</b>
              </div>
              <div style="font-size: 10px; color: #38bdf8;">
                Command: ${rd.broUnitInCharge}
              </div>
            </div>
          `);

          roadMarker.addTo(groups.roads);
        });
      });
    }

    // LAYER 4: Villages & Settlements
    if (layers.villages) {
      MOCK_GIS_VILLAGES.forEach((vil) => {
        const icon = createVillageIcon(L, vil.population);
        const vMarker = L.marker([vil.lat, vil.lng], { icon });

        vMarker.bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <span style="font-size: 9px; font-weight: bold; background: #312e81; color: #a5b4fc; padding: 2px 5px; border-radius: 3px;">
              VULNERABLE SETTLEMENT
            </span>
            <h4 style="font-size: 13px; font-weight: 800; color: #ffffff; margin: 4px 0 2px 0;">${vil.name}</h4>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              ${vil.district}, ${vil.state} • Elev: ${vil.elevation}m
            </div>
            <div style="background: #080c14; padding: 6px; border-radius: 4px; border: 1px solid #1e2f4a; font-size: 11px; margin-bottom: 4px;">
              <div>Population at Hazard: <b style="color: #ffffff;">${vil.population.toLocaleString()} Pax</b></div>
              <div>Nearest Lifeline: <b style="color: #38bdf8;">${vil.nearestRoad}</b></div>
            </div>
            <div style="font-size: 10px; color: #34d399;">
              Designated Shelter: <b>${vil.evacuationCenterName}</b> (${vil.evacuationDistanceKm} km)
            </div>
          </div>
        `);

        vMarker.addTo(groups.villages);
      });
    }

    // LAYER 5: Sensors
    if (layers.sensors) {
      MOCK_SENSORS.forEach((s) => {
        const isCrit = s.status === 'Critical';
        const icon = createSensorIcon(L, s.type, isCrit);
        const sMarker = L.marker([s.lat, s.lng], { icon });

        sMarker.bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 9px; font-weight: bold; background: #082f49; color: #38bdf8; padding: 2px 4px; border-radius: 2px;">
                ${s.type.toUpperCase()}
              </span>
              <span style="font-size: 10px; color: ${isCrit ? '#ef4444' : '#10b981'}; font-weight: bold;">
                ${s.status}
              </span>
            </div>
            <h4 style="font-size: 12px; font-weight: bold; color: #ffffff; margin-bottom: 2px;">${s.name}</h4>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">
              Location: ${s.locationName}, ${s.district}
            </div>
            <div style="background: #080c14; padding: 6px; border-radius: 4px; border: 1px solid #1e2f4a; font-size: 11px; margin-bottom: 4px;">
              Current Reading: <b style="color: ${isCrit ? '#ef4444' : '#38bdf8'};">${s.currentValue} ${s.unit}</b>
            </div>
            <div style="font-size: 9px; color: #64748b;">
              Battery: ${s.batteryLevel}% • Signal: ${s.signalStrength}% • Sync: ${s.lastTransmission}
            </div>
          </div>
        `);

        sMarker.addTo(groups.sensors);
      });
    }

    // LAYER 6: Landslide Incidents (Distinct icons for Landslide, Road Blockage, Crack, Flood, Slope Movement)
    if (layers.incidents) {
      MOCK_INCIDENTS.forEach((inc) => {
        const icon = createIncidentIcon(L, inc.type);
        const incMarker = L.marker([inc.lat, inc.lng], { icon });

        incMarker.bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 9px; font-weight: bold; color: #fca5a5; background: #7f1d1d; padding: 2px 4px; border-radius: 2px;">
                ${inc.type.toUpperCase()}
              </span>
              <span style="font-size: 10px; font-family: monospace; color: #38bdf8;">${inc.id}</span>
            </div>
            <h4 style="font-size: 12px; font-weight: bold; color: #ffffff; margin-bottom: 2px;">${inc.location}</h4>
            <p style="font-size: 10px; color: #cbd5e1; margin-bottom: 6px;">${inc.description}</p>
            <div style="font-size: 10px; color: #94a3b8; border-top: 1px solid #1e2f4a; pt-1;">
              Reported: <b>${inc.reportedTime}</b> by ${inc.source}
            </div>
          </div>
        `);

        incMarker.addTo(groups.incidents);
      });
    }

    // LAYER 7: Field Reports
    if (layers.fieldReports) {
      MOCK_FIELD_REPORTS.forEach((rep) => {
        const isVerified = rep.verificationStatus === 'Verified';
        const icon = createFieldReportIcon(L, isVerified);
        const repMarker = L.marker([rep.lat, rep.lng], { icon });

        repMarker.bindPopup(`
          <div style="font-family: Inter, sans-serif; padding: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 9px; font-weight: bold; color: #fef08a; background: #78350f; padding: 2px 4px; border-radius: 2px;">
                GROUND REPORT
              </span>
              <span style="font-size: 9px; font-weight: bold; color: ${isVerified ? '#34d399' : '#fbbf24'};">
                ${rep.verificationStatus}
              </span>
            </div>
            <h4 style="font-size: 12px; font-weight: bold; color: #ffffff; margin-bottom: 2px;">${rep.landmark}</h4>
            <p style="font-size: 10px; color: #cbd5e1; margin-bottom: 4px;">${rep.description}</p>
            <div style="font-size: 9px; color: #94a3b8;">
              Reporter: <b>${rep.reporterName}</b> (${rep.reporterType}) • ${rep.reportedAt}
            </div>
          </div>
        `);

        repMarker.addTo(groups.fieldReports);
      });
    }
  }, [
    layers,
    selectedZone,
    selectedState,
    riskFilter,
    setSelectedZone,
    onZoneClick,
  ]);

  // Handle Location Search selection
  const handleLocationSelect = useCallback(
    (lat: number, lng: number, zoom: number) => {
      if (!mapInstanceRef.current) return;
      const { map } = mapInstanceRef.current;
      map.flyTo([lat, lng], zoom, { duration: 1.5 });
    },
    []
  );

  // Handle Current Location Geolocation
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    const { map, L, groups } = mapInstanceRef.current;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;

        if (userLocationMarkerRef.current) {
          groups.userLocation.removeLayer(userLocationMarkerRef.current);
        }

        const icon = createGeolocationIcon(L);
        const marker = L.marker([latitude, longitude], { icon });
        marker.bindPopup(
          `<div style="font-family: Inter, sans-serif; font-size: 11px; padding: 4px;">
            <b>Your Location</b><br/>
            GPS: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E
          </div>`
        );
        marker.addTo(groups.userLocation);
        userLocationMarkerRef.current = marker;

        map.flyTo([latitude, longitude], 13, { duration: 1.5 });
        marker.openPopup();
      },
      () => {
        setIsLocating(false);
        // Fallback default: zoom to Gangtok
        map.flyTo([27.3389, 88.6065], 12, { duration: 1.5 });
      }
    );
  }, []);

  // Reset to Northeast India view
  const handleResetView = useCallback(() => {
    if (!mapInstanceRef.current) return;
    const { map } = mapInstanceRef.current;
    map.flyTo([NER_CENTER.lat, NER_CENTER.lng], NER_CENTER.zoom, {
      duration: 1.2,
    });
  }, []);

  return (
    <div
      className={`relative w-full ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen bg-eoc-bg' : heightClass
      } rounded-xl overflow-hidden border border-eoc-border shadow-2xl transition-all flex flex-col`}
    >
      {/* Top Map Controls Header */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto">
            <MapControls
              activeBaseTile={activeBaseTile}
              onTileChange={setActiveBaseTile}
              onLocationSelect={handleLocationSelect}
              onLocateMe={handleLocateMe}
              onResetView={handleResetView}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              isLocating={isLocating}
            />
          </div>

          <div className="pointer-events-auto">
            <MapLayerSelector
              layers={layers}
              onToggle={handleToggleLayer}
              counts={{
                riskZones: MOCK_GIS_RISK_ZONES.length,
                roads: MOCK_ROADS.length,
                villages: MOCK_GIS_VILLAGES.length,
                sensors: MOCK_SENSORS.length,
                incidents: MOCK_INCIDENTS.length,
                fieldReports: MOCK_FIELD_REPORTS.length,
              }}
            />
          </div>
        </div>
      )}

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1" />

      {/* Floating Risk Legend (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <MapLegend />
      </div>
    </div>
  );
}
