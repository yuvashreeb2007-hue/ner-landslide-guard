// TypeScript definitions for the Geotechnical Soil & Sensor Monitoring Module

export type SensorType = 
  | 'Soil Moisture' 
  | 'Rain Gauge' 
  | 'Slope Tilt' 
  | 'Ground Movement';

export type SensorStatus = 
  | 'ONLINE' 
  | 'OFFLINE' 
  | 'WARNING' 
  | 'CRITICAL';

export type SimulationScenario = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface SensorHistoryPoint {
  timestamp: string;
  value: number;
  battery: number;
  signalStrength: number;
}

export interface SensorData {
  sensorId: string;
  district: string;
  state: string;
  location: string;
  latitude: number;
  longitude: number;
  sensorType: SensorType;
  soilMoisture: number; // % saturation
  currentValue: number; // dynamic value matching sensorType
  unit: string; // '%', 'mm/hr', '°', 'mm'
  threshold: number; // critical safety boundary
  battery: number; // 0 - 100%
  signalStrength: number; // 0 - 100%
  lastUpdated: string;
  status: SensorStatus;
  trend: 'STABLE' | 'RISING' | 'FALLING' | 'CRITICAL_SURGE';
  installationDepthM?: number;
  history: SensorHistoryPoint[];
}

export interface SensorKPIs {
  totalSensors: number;
  online: number;
  offline: number;
  warning: number;
  critical: number;
  averageBattery: number;
  averageSignal: number;
}

export interface SensorFilterState {
  search: string;
  type: string;
  status: string;
  district: string;
}
