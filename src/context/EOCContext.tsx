'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  RiskZone, 
  Village,
  District, 
  Incident, 
  Sensor, 
  Road, 
  Alert, 
  WeatherData, 
  FieldReport, 
  ResponseTeam, 
  EOCStats,
  RiskLevel 
} from '../types';
import {
  MOCK_DISTRICTS,
  MOCK_INCIDENTS,
  MOCK_SENSORS,
  MOCK_ROADS,
  MOCK_ALERTS,
  MOCK_WEATHER_STATIONS,
  MOCK_FIELD_REPORTS,
  MOCK_RESPONSE_TEAMS,
  INITIAL_EOC_STATS,
} from '../data/mockData';
import { MOCK_GIS_RISK_ZONES, MOCK_GIS_VILLAGES } from '../data/mockRiskZones';

export interface MapLayersState {
  heatmap: boolean;
  riskZones: boolean;
  roads: boolean;
  villages: boolean;
  sensors: boolean;
  incidents: boolean;
  fieldReports: boolean;
}

interface EOCContextType {
  eocStats: EOCStats;
  selectedZone: RiskZone | null;
  selectedState: string;
  riskFilter: 'ALL' | RiskLevel;
  timeHorizon: 'LIVE' | '+24H' | '+48H' | '+72H';
  mapLayers: MapLayersState;
  riskZones: RiskZone[];
  villages: Village[];
  districts: District[];
  incidents: Incident[];
  sensors: Sensor[];
  roads: Road[];
  alerts: Alert[];
  fieldReports: FieldReport[];
  weatherStations: WeatherData[];
  responseTeams: ResponseTeam[];
  systemTime: string;
  audioAlertsEnabled: boolean;
  isSimulating: boolean;

  setSelectedZone: (zone: RiskZone | null) => void;
  setSelectedState: (state: string) => void;
  setRiskFilter: (filter: 'ALL' | RiskLevel) => void;
  setTimeHorizon: (horizon: 'LIVE' | '+24H' | '+48H' | '+72H') => void;
  toggleMapLayer: (layer: keyof MapLayersState) => void;
  toggleAudioAlerts: () => void;
  submitFieldReport: (report: Omit<FieldReport, 'id' | 'reportedAt' | 'verificationStatus'>) => string;
  verifyFieldReport: (id: string, status: 'Verified' | 'Dismissed', officerName?: string) => void;
  dispatchResponseTeam: (incidentId: string, teamId: string) => void;
  createEmergencyAlert: (newAlert: Omit<Alert, 'id' | 'issuedTime' | 'broadcastDeliveredCount' | 'status'>) => void;
  simulateCloudburst: (targetDistrict?: string) => void;
  acknowledgeAlert: (id: string) => void;
}

const EOCContext = createContext<EOCContextType | undefined>(undefined);

export function EOCProvider({ children }: { children: React.ReactNode }) {
  const [eocStats, setEocStats] = useState<EOCStats>(INITIAL_EOC_STATS);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(MOCK_GIS_RISK_ZONES[0]);
  const [selectedState, setSelectedState] = useState<string>('All NER');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [timeHorizon, setTimeHorizon] = useState<'LIVE' | '+24H' | '+48H' | '+72H'>('LIVE');
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const [mapLayers, setMapLayers] = useState<MapLayersState>({
    heatmap: true,
    riskZones: true,
    roads: true,
    villages: true,
    sensors: true,
    incidents: true,
    fieldReports: true,
  });

  const [riskZones, setRiskZones] = useState<RiskZone[]>(MOCK_GIS_RISK_ZONES);
  const [villages] = useState<Village[]>(MOCK_GIS_VILLAGES);
  const [districts] = useState<District[]>(MOCK_DISTRICTS);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [sensors, setSensors] = useState<Sensor[]>(MOCK_SENSORS);
  const [roads, setRoads] = useState<Road[]>(MOCK_ROADS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [fieldReports, setFieldReports] = useState<FieldReport[]>(MOCK_FIELD_REPORTS);
  const [weatherStations, setWeatherStations] = useState<WeatherData[]>(MOCK_WEATHER_STATIONS);
  const [responseTeams, setResponseTeams] = useState<ResponseTeam[]>(MOCK_RESPONSE_TEAMS);
  const [systemTime, setSystemTime] = useState<string>('');

  // Update real-time clock in IST
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      };
      setSystemTime(now.toLocaleString('en-IN', options) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleMapLayer = (layer: keyof MapLayersState) => {
    setMapLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const toggleAudioAlerts = () => {
    setAudioAlertsEnabled((prev) => !prev);
  };

  const submitFieldReport = (reportData: Omit<FieldReport, 'id' | 'reportedAt' | 'verificationStatus'>) => {
    const newId = `REP-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const newReport: FieldReport = {
      ...reportData,
      id: newId,
      reportedAt: 'Just now',
      verificationStatus: 'Pending Verification',
    };

    setFieldReports((prev) => [newReport, ...prev]);
    setEocStats((prev) => ({
      ...prev,
      reportsToday: prev.reportsToday + 1,
      trends: {
        ...prev.trends,
        reportsDelta: prev.trends.reportsDelta + 1,
      },
    }));

    return newId;
  };

  const verifyFieldReport = (id: string, status: 'Verified' | 'Dismissed', officerName = 'Command Duty Officer (EOC)') => {
    setFieldReports((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          return {
            ...rep,
            verificationStatus: status,
            assignedOfficer: officerName,
          };
        }
        return rep;
      })
    );

    if (status === 'Verified') {
      // Find the report and auto-elevate to Incident
      const rep = fieldReports.find((r) => r.id === id);
      if (rep) {
        const newIncId = `INC-2026-0${Math.floor(892 + Math.random() * 50)}`;
        const newIncident: Incident = {
          id: newIncId,
          district: rep.district,
          state: rep.state,
          location: rep.landmark,
          lat: rep.lat,
          lng: rep.lng,
          elevation: 650,
          riskLevel: rep.severity,
          type: rep.hazardType,
          reportedTime: 'Just now',
          source: rep.reporterType,
          reporterName: rep.reporterName,
          reporterContact: rep.contactNumber,
          status: 'Active',
          description: rep.description,
          affectedPopulation: 650,
          roadStatus: 'Partial Lane Open',
          responseTeamsDispatched: [],
          recommendedAction: 'Dispatch initial scout team and issue local area advisory.',
        };
        setIncidents((prev) => [newIncident, ...prev]);
      }
    }
  };

  const dispatchResponseTeam = (incidentId: string, teamId: string) => {
    setResponseTeams((prev) =>
      prev.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            status: 'Deployed',
            assignedIncidentId: incidentId,
          };
        }
        return team;
      })
    );

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const team = responseTeams.find((t) => t.id === teamId);
          const teamName = team?.name || teamId;
          return {
            ...inc,
            status: 'Response Dispatched',
            responseTeamsDispatched: Array.from(new Set([...inc.responseTeamsDispatched, teamName])),
          };
        }
        return inc;
      })
    );
  };

  const createEmergencyAlert = (newAlertData: Omit<Alert, 'id' | 'issuedTime' | 'broadcastDeliveredCount' | 'status'>) => {
    const alertId = `ALT-CAP-2026-0${Math.floor(43 + Math.random() * 50)}`;
    const newAlert: Alert = {
      ...newAlertData,
      id: alertId,
      issuedTime: 'Just now (' + new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST)',
      broadcastDeliveredCount: Math.floor(15000 + Math.random() * 45000),
      status: 'Active',
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setEocStats((prev) => ({
      ...prev,
      activeAlerts: prev.activeAlerts + 1,
      trends: { ...prev.trends, alertsDelta: prev.trends.alertsDelta + 1 },
    }));
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Broadcasted' } : a))
    );
  };

  const simulateCloudburst = (targetDistrict = 'Pakyong') => {
    setIsSimulating(true);
    // Increase rainfall, surge pore pressure, shift FoS to critical
    setRiskZones((prev) =>
      prev.map((zone) => {
        if (zone.district.toLowerCase().includes(targetDistrict.toLowerCase())) {
          return {
            ...zone,
            rainfall24h: Number((zone.rainfall24h + 45.2).toFixed(1)),
            soilMoisture: Math.min(99, zone.soilMoisture + 6),
            poreWaterPressure: Number((zone.poreWaterPressure + 12.4).toFixed(1)),
            factorOfSafety: Number(Math.max(0.72, zone.factorOfSafety - 0.12).toFixed(2)),
            riskScore: Math.min(99, zone.riskScore + 5),
            riskLevel: 'CRITICAL',
            lastUpdated: 'Just now (Cloudburst Triggered)',
          };
        }
        return zone;
      })
    );

    // Trigger an emergency alert
    createEmergencyAlert({
      title: `CRITICAL ALERT: Cloudburst Precipitation Surge in ${targetDistrict}`,
      severity: 'RED',
      riskLevel: 'CRITICAL',
      state: 'Sikkim',
      affectedDistrict: targetDistrict,
      affectedVillages: ['Singtam', '29th Mile', 'Rongli', 'Dikchu'],
      reason: `Automated AWS radar trigger: Extreme cloudburst intensity (>65 mm/hr) detected over ${targetDistrict}. Factor of safety dropped below 0.85.`,
      validUntil: 'Next 6 Hours',
      recommendedAction: 'Immediate siren activation & total valley evacuation to higher relief nodes.',
      issuedBy: 'NER LandslideGuard Automated ML Early Warning System',
      capChannel: ['SMS', 'WhatsApp', 'Community Siren', 'Radio Broadcast', 'CAP-IPAWS'],
    });

    setTimeout(() => {
      setIsSimulating(false);
    }, 2000);
  };

  return (
    <EOCContext.Provider
      value={{
        eocStats,
        selectedZone,
        selectedState,
        riskFilter,
        timeHorizon,
        mapLayers,
        riskZones,
        villages,
        districts,
        incidents,
        sensors,
        roads,
        alerts,
        fieldReports,
        weatherStations,
        responseTeams,
        systemTime,
        audioAlertsEnabled,
        isSimulating,
        setSelectedZone,
        setSelectedState,
        setRiskFilter,
        setTimeHorizon,
        toggleMapLayer,
        toggleAudioAlerts,
        submitFieldReport,
        verifyFieldReport,
        dispatchResponseTeam,
        createEmergencyAlert,
        simulateCloudburst,
        acknowledgeAlert,
      }}
    >
      {children}
    </EOCContext.Provider>
  );
}

export function useEOC() {
  const context = useContext(EOCContext);
  if (!context) {
    throw new Error('useEOC must be used within an EOCProvider');
  }
  return context;
}
