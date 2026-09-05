// TypeScript definitions for the Provider-Independent Weather & Rainfall Intelligence Module

export type RainfallThresholdLevel = 'Normal' | 'Watch' | 'Warning' | 'Danger';

export type RainfallIntensityCategory = 
  | 'None' 
  | 'Light (<2.5 mm/hr)' 
  | 'Moderate (2.5-7.5 mm/hr)' 
  | 'Heavy (7.5-15 mm/hr)' 
  | 'Very Heavy (15-30 mm/hr)' 
  | 'Cloudburst (>30 mm/hr)';

export interface HourlyRainfallRecord {
  hour: string; // e.g. "00:00", "03:00", "06:00"
  rainfallMm: number;
  cumulative24hMm: number;
  intensityMmHr: number;
  temperatureC: number;
  thresholdLevel: RainfallThresholdLevel;
}

export interface DailyForecastRecord {
  date: string;
  dayName: string;
  rainfallExpectedMm: number;
  maxRainfallIntensityMmHr: number;
  temperatureMaxC: number;
  temperatureMinC: number;
  condition: string;
  hazardRiskProbability: number; // 0 - 100%
  thresholdLevel: RainfallThresholdLevel;
}

// Raw Provider Outputs (what an API returns)
export interface RawCurrentWeather {
  district: string;
  state: string;
  temperature: number; // Celsius
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string;
  barometricPressureHpa: number;
  condition: string;
  cloudCoverPercent: number;
  visibilityKm: number;
  timestamp: string;
}

export interface RawRainfallData {
  district: string;
  state: string;
  currentRainfallMmHr: number; // instant rate
  rainfall24hMm: number;
  rainfall7dMm: number;
  hourlyHistory: HourlyRainfallRecord[];
  lastMeasurementTime: string;
}

export interface RawForecastData {
  district: string;
  state: string;
  forecast24hMm: number;
  forecast72hMm: number;
  dailyForecasts: DailyForecastRecord[];
  issuedAt: string;
}

// Normalized Data (Enriched & Standardized after passing through WeatherAdapter)
export interface NormalizedWeatherData {
  district: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
    elevation: number;
  };
  currentWeather: {
    temperature: number;
    humidity: number;
    dewPoint: number;
    windSpeed: number;
    windDirection: string;
    pressureHpa: number;
    condition: string;
    cloudCoverPercent: number;
    visibilityKm: number;
  };
  rainfall: {
    currentRateMmHr: number;
    rainfall24hMm: number;
    rainfall7dMm: number;
    forecast24hMm: number;
    forecast72hMm: number;
    intensityCategory: RainfallIntensityCategory;
    hourlyHistory: HourlyRainfallRecord[];
    dailyForecasts: DailyForecastRecord[];
  };
  threshold: {
    level: RainfallThresholdLevel;
    description: string;
    actionRequired: string;
    triggerStatus: 'Normal' | 'Exceeded Watch' | 'Exceeded Warning' | 'Critical Danger Breached';
    saturationIndex: number; // 0.0 - 1.0 (based on 7d cumulative & 24h rain)
  };
  riskImpact: {
    scoreMultiplier: number; // e.g., 1.0 (Normal) to 1.85 (Danger)
    calculatedRiskScore: number; // 0 - 100
    landslideProbability: number; // 0.0 - 1.0
    contributingAlert: string;
  };
  awsStation: {
    stationId: string;
    stationName: string;
    isOnline: boolean;
    batteryLevel: number;
    lastTelemetry: string;
  };
}

export interface DistrictWeatherSummary {
  district: string;
  state: string;
  currentRainfallMm: number;
  rainfall24hMm: number;
  rainfall7dMm: number;
  forecast24hMm: number;
  forecast72hMm: number;
  temperatureC: number;
  humidityPercent: number;
  intensityCategory: RainfallIntensityCategory;
  thresholdLevel: RainfallThresholdLevel;
  riskImpactScore: number; // 0-100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  statusDescription: string;
}
