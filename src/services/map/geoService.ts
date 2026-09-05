import { RiskZone, Village, Road, Incident, NERState } from '@/types';
import { MOCK_GIS_RISK_ZONES, MOCK_GIS_VILLAGES } from '@/data/mockRiskZones';
import { MOCK_ROADS, MOCK_INCIDENTS } from '@/data/mockData';

export const NER_CENTER = { lat: 26.2, lng: 92.9, zoom: 7 };

export const NER_BOUNDS: [[number, number], [number, number]] = [
  [21.8, 88.0], // Southwest (Tripura/Bengal border)
  [29.5, 97.5], // Northeast (Arunachal/China border)
];

export const STATE_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'All NER': { lat: 26.2, lng: 92.9, zoom: 7 },
  'Assam': { lat: 26.15, lng: 92.8, zoom: 7 },
  'Arunachal Pradesh': { lat: 27.8, lng: 94.2, zoom: 7 },
  'Meghalaya': { lat: 25.45, lng: 91.35, zoom: 8 },
  'Manipur': { lat: 24.75, lng: 93.9, zoom: 8 },
  'Mizoram': { lat: 23.4, lng: 92.8, zoom: 8 },
  'Nagaland': { lat: 25.9, lng: 94.3, zoom: 8 },
  'Tripura': { lat: 23.8, lng: 91.5, zoom: 8 },
  'Sikkim': { lat: 27.5, lng: 88.5, zoom: 9 },
};

export interface SearchResultItem {
  id: string;
  name: string;
  category: 'Risk Zone' | 'Village' | 'Highway' | 'Incident' | 'District' | 'State';
  district?: string;
  state?: string;
  lat: number;
  lng: number;
  zoom: number;
  meta?: string;
}

export function searchNERLocations(query: string): SearchResultItem[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResultItem[] = [];

  // Search States
  Object.keys(STATE_CENTERS).forEach((st) => {
    if (st !== 'All NER' && st.toLowerCase().includes(q)) {
      const c = STATE_CENTERS[st];
      results.push({
        id: `state-${st}`,
        name: `${st} (State)`,
        category: 'State',
        state: st,
        lat: c.lat,
        lng: c.lng,
        zoom: c.zoom,
        meta: 'North Eastern State',
      });
    }
  });

  // Search Risk Zones
  MOCK_GIS_RISK_ZONES.forEach((rz) => {
    if (
      rz.name.toLowerCase().includes(q) ||
      rz.district.toLowerCase().includes(q) ||
      rz.id.toLowerCase().includes(q) ||
      rz.nearestRoad.toLowerCase().includes(q)
    ) {
      results.push({
        id: rz.id,
        name: rz.name,
        category: 'Risk Zone',
        district: rz.district,
        state: rz.state,
        lat: rz.lat,
        lng: rz.lng,
        zoom: 12,
        meta: `Risk Score: ${rz.riskScore}/100 (${rz.riskLevel})`,
      });
    }
  });

  // Search Villages
  MOCK_GIS_VILLAGES.forEach((vil) => {
    if (
      vil.name.toLowerCase().includes(q) ||
      vil.district.toLowerCase().includes(q)
    ) {
      results.push({
        id: vil.id,
        name: vil.name,
        category: 'Village',
        district: vil.district,
        state: vil.state,
        lat: vil.lat,
        lng: vil.lng,
        zoom: 13,
        meta: `Pop: ${vil.population.toLocaleString()} • ${vil.riskLevel} Risk`,
      });
    }
  });

  // Search Highways
  MOCK_ROADS.forEach((rd) => {
    if (
      rd.name.toLowerCase().includes(q) ||
      rd.route.toLowerCase().includes(q)
    ) {
      const cp = rd.criticalChokepoints[0];
      results.push({
        id: rd.id,
        name: `${rd.name} (${rd.route})`,
        category: 'Highway',
        district: rd.district,
        state: rd.state,
        lat: cp ? cp.lat : 26.2,
        lng: cp ? cp.lng : 92.9,
        zoom: 11,
        meta: `Status: ${rd.status}`,
      });
    }
  });

  return results.slice(0, 8);
}

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}
