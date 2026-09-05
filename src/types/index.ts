// Core TypeScript types for NER LandslideGuard

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE';

export type NERState = 
  | 'Assam'
  | 'Arunachal Pradesh'
  | 'Meghalaya'
  | 'Manipur'
  | 'Mizoram'
  | 'Nagaland'
  | 'Tripura'
  | 'Sikkim';

export type IncidentType = 
  | 'Landslide'
  | 'Crack'
  | 'Road Blockage'
  | 'Slope Movement'
  | 'Flood'
  | 'Flash Flood'
  | 'Rockfall'
  | 'Mudflow';

export type IncidentStatus = 'Active' | 'Under Review' | 'Response Dispatched' | 'Resolved' | 'Monitoring';

export type SensorType = 
  | 'Inclinometer' 
  | 'Piezometer' 
  | 'Soil Moisture' 
  | 'Tiltmeter' 
  | 'Rain Gauge' 
  | 'Crackmeter';

export type SensorStatus = 'Online' | 'Warning' | 'Critical' | 'Offline' | 'Calibrating';

export type RoadStatus = 'Clear' | 'Partial Lane Open' | 'Completely Blocked' | 'High Risk Warning' | 'Under Clearance';

export type ReporterType = 'Citizen' | 'Field Officer' | 'NDRF Scout' | 'BRO Patrol' | 'Forest Guard' | 'Police Patrol';

export interface GeoLocation {
  lat: number;
  lng: number;
  elevation: number; // meters above sea level
}

export interface RiskZone {
  id: string;
  name: string;
  district: string;
  state: NERState;
  lat: number;
  latitude?: number; // alias for compatibility
  lng: number;
  longitude?: number; // alias for compatibility
  elevation: number;
  slope: number; // in degrees
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  rainfall24h: number; // in mm
  rainfall7d: number; // in mm
  soilMoisture: number; // % saturation
  factorOfSafety: number; // Geotechnical FoS (<1.0 is failure, 1.0-1.3 critical, >1.5 safe)
  poreWaterPressure: number; // kPa
  historicalLandslides: number; // count in past 10 years
  nearestRoad: string;
  nearestRoadDistanceKm: number;
  populationExposed: number;
  affectedVillages: string[];
  lastUpdated: string;
  riskExplanation: {
    primaryTrigger: string;
    contributingFactors: string[];
    geologicalFormation: string;
    aiConfidence: number; // %
    recommendedAction: string;
  };
}

export interface Village {
  id: string;
  name: string;
  district: string;
  state: NERState;
  lat: number;
  lng: number;
  elevation: number;
  population: number;
  riskLevel: RiskLevel;
  nearestRiskZoneId: string;
  nearestRoad: string;
  evacuationCenterName: string;
  evacuationDistanceKm: number;
}

export interface District {
  id: string;
  name: string;
  state: NERState;
  hqLocation: string;
  lat: number;
  lng: number;
  overallRiskLevel: RiskLevel;
  activeCriticalZones: number;
  population: number;
  rainfall24h: number;
  soilMoistureAvg: number;
  sdmaOfficeContact: string;
  evacuationCentresCount: number;
}

export interface Incident {
  id: string;
  district: string;
  state: NERState;
  location: string;
  lat: number;
  lng: number;
  elevation: number;
  riskLevel: RiskLevel;
  type: IncidentType;
  reportedTime: string;
  source: ReporterType;
  reporterName?: string;
  reporterContact?: string;
  status: IncidentStatus;
  description: string;
  affectedPopulation: number;
  roadStatus: RoadStatus;
  estimatedVolumeM3?: number;
  imageUrl?: string;
  responseTeamsDispatched: string[];
  recommendedAction: string;
}

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  district: string;
  state: NERState;
  locationName: string;
  lat: number;
  lng: number;
  elevation: number;
  status: SensorStatus;
  batteryLevel: number; // %
  signalStrength: number; // % (GSM/LoRaWAN)
  lastTransmission: string;
  currentValue: number;
  unit: string;
  normalRange: [number, number];
  warningThreshold: number;
  criticalThreshold: number;
  trend: 'rising' | 'falling' | 'stable';
  readingsHistory: { timestamp: string; value: number }[];
}

export interface Road {
  id: string;
  name: string; // e.g. NH-10, NH-29, NH-6
  route: string; // e.g. "Siliguri - Gangtok"
  state: NERState;
  district: string;
  totalLengthKm: number;
  blockedPointsCount: number;
  status: RoadStatus;
  criticalChokepoints: {
    locationName: string;
    chainageKm: number;
    lat: number;
    lng: number;
    status: RoadStatus;
    riskScore: number;
    estimatedClearanceEta?: string;
    heavyMachineryDeployed: string[];
  }[];
  detourRouteAvailable: boolean;
  detourDescription?: string;
  broUnitInCharge: string;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';
  riskLevel: RiskLevel;
  state: NERState;
  affectedDistrict: string;
  affectedVillages: string[];
  reason: string;
  issuedTime: string;
  validUntil: string;
  recommendedAction: string;
  issuedBy: string; // e.g. "ASDMA & GSI Joint Early Warning Center"
  capChannel: ('SMS' | 'WhatsApp' | 'Community Siren' | 'Radio Broadcast' | 'CAP-IPAWS')[];
  broadcastDeliveredCount: number;
  status: 'Active' | 'Broadcasted' | 'Cancelled' | 'Expired';
}

export interface WeatherData {
  stationId: string;
  stationName: string;
  district: string;
  state: NERState;
  lat: number;
  lng: number;
  tempC: number;
  humidity: number;
  rainfallCurrentHourMm: number;
  rainfall24hMm: number;
  rainfall7dMm: number;
  cloudburstProbability: number; // %
  forecast24hMm: number;
  windSpeedKmh: number;
  barometricPressureHpa: number;
  imdWarningColor: 'Red' | 'Orange' | 'Yellow' | 'Green';
}

export interface FieldReport {
  id: string;
  reporterType: ReporterType;
  reporterName: string;
  contactNumber: string;
  district: string;
  state: NERState;
  landmark: string;
  lat: number;
  lng: number;
  hazardType: IncidentType;
  severity: RiskLevel;
  description: string;
  photoUrl?: string;
  videoUrl?: string;
  reportedAt: string;
  verificationStatus: 'Pending Verification' | 'Verified' | 'Dismissed';
  assignedOfficer?: string;
}

export interface ResponseTeam {
  id: string;
  name: string;
  unit: string;
  baseLocation: string;
  state: NERState;
  personnelCount: number;
  status: 'Deployed' | 'Standing By' | 'In Transit' | 'Demobilizing';
  assignedIncidentId?: string;
  equipment: string[];
  contactOfficer: string;
  contactPhone: string;
}

export interface PredictionModelMetrics {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  trainingSamples: number;
  featuresUsed: { name: string; importanceWeight: number }[];
}

export interface EOCStats {
  activeCriticalZones: number;
  highRiskZones: number;
  roadsBlocked: number;
  activeAlerts: number;
  reportsToday: number;
  sensorsOnline: number;
  totalSensors: number;
  populationAtRisk: number;
  activeResponseTeams: number;
  trends: {
    criticalZonesDelta: number;
    highRiskZonesDelta: number;
    roadsBlockedDelta: number;
    alertsDelta: number;
    reportsDelta: number;
    sensorsOnlinePercent: number;
  };
}
