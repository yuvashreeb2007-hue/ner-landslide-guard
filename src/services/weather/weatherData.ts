import { 
  RawCurrentWeather, 
  RawRainfallData, 
  RawForecastData,
  HourlyRainfallRecord,
  DailyForecastRecord
} from './types';

export interface NERDistrictMetadata {
  district: string;
  state: string;
  lat: number;
  lng: number;
  elevation: number;
  awsStationId: string;
  awsStationName: string;
  batteryLevel: number;
}

export const NER_DISTRICTS_METADATA: NERDistrictMetadata[] = [
  {
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    lat: 25.2702,
    lng: 91.7323,
    elevation: 1430,
    awsStationId: 'AWS-ML-SOHRA-01',
    awsStationName: 'Cherrapunji Sohra AWS Radar Site',
    batteryLevel: 94
  },
  {
    district: 'Pakyong',
    state: 'Sikkim',
    lat: 27.2345,
    lng: 88.5123,
    elevation: 860,
    awsStationId: 'AWS-SK-SINGTAM-03',
    awsStationName: 'Singtam 29th Mile Hydro-Met Station',
    batteryLevel: 88
  },
  {
    district: 'Noney',
    state: 'Manipur',
    lat: 24.7890,
    lng: 93.6540,
    elevation: 890,
    awsStationId: 'AWS-MN-TUPUL-02',
    awsStationName: 'Tupul Valley Ijei River AWS',
    batteryLevel: 91
  },
  {
    district: 'Dima Hasao',
    state: 'Assam',
    lat: 25.1764,
    lng: 93.0234,
    elevation: 680,
    awsStationId: 'AWS-AS-HAFLONG-05',
    awsStationName: 'Haflong Railway Cutting AWS',
    batteryLevel: 82
  },
  {
    district: 'West Kameng',
    state: 'Arunachal Pradesh',
    lat: 27.0125,
    lng: 92.6450,
    elevation: 2150,
    awsStationId: 'AWS-AR-BHALUK-01',
    awsStationName: 'Bhalukpong Sela Pass Base Station',
    batteryLevel: 97
  },
  {
    district: 'Aizawl',
    state: 'Mizoram',
    lat: 23.7420,
    lng: 92.7230,
    elevation: 1132,
    awsStationId: 'AWS-MZ-AIZAWL-04',
    awsStationName: 'Aizawl Bawngkawn Ridge AWS',
    batteryLevel: 86
  },
  {
    district: 'Kohima',
    state: 'Nagaland',
    lat: 25.6420,
    lng: 94.1120,
    elevation: 1444,
    awsStationId: 'AWS-NL-KOHIMA-02',
    awsStationName: 'Kohima Phesama Highway AWS',
    batteryLevel: 89
  },
  {
    district: 'North Tripura',
    state: 'Tripura',
    lat: 23.9540,
    lng: 92.2780,
    elevation: 280,
    awsStationId: 'AWS-TR-JAMPUI-01',
    awsStationName: 'Jampui Hills Vanghmun AWS',
    batteryLevel: 95
  }
];

// Seeded raw meteorological data for Northeast India
export const MOCK_RAW_CURRENT_WEATHER: Record<string, RawCurrentWeather> = {
  'East Khasi Hills': {
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    temperature: 18.2,
    humidity: 98,
    windSpeed: 24.5,
    windDirection: 'SSW',
    barometricPressureHpa: 1004.2,
    condition: 'Torrential Monsoonal Downpour',
    cloudCoverPercent: 100,
    visibilityKm: 1.2,
    timestamp: new Date().toISOString()
  },
  'Pakyong': {
    district: 'Pakyong',
    state: 'Sikkim',
    temperature: 17.5,
    humidity: 96,
    windSpeed: 18.0,
    windDirection: 'NE',
    barometricPressureHpa: 1006.8,
    condition: 'Heavy Persistent Rain',
    cloudCoverPercent: 100,
    visibilityKm: 2.0,
    timestamp: new Date().toISOString()
  },
  'Noney': {
    district: 'Noney',
    state: 'Manipur',
    temperature: 21.8,
    humidity: 94,
    windSpeed: 16.0,
    windDirection: 'S',
    barometricPressureHpa: 1008.0,
    condition: 'Squall Showers with Thunder',
    cloudCoverPercent: 95,
    visibilityKm: 3.5,
    timestamp: new Date().toISOString()
  },
  'Dima Hasao': {
    district: 'Dima Hasao',
    state: 'Assam',
    temperature: 24.5,
    humidity: 88,
    windSpeed: 14.2,
    windDirection: 'E',
    barometricPressureHpa: 1010.4,
    condition: 'Intermittent Showers',
    cloudCoverPercent: 90,
    visibilityKm: 5.0,
    timestamp: new Date().toISOString()
  },
  'West Kameng': {
    district: 'West Kameng',
    state: 'Arunachal Pradesh',
    temperature: 13.8,
    humidity: 92,
    windSpeed: 12.0,
    windDirection: 'NNE',
    barometricPressureHpa: 1007.5,
    condition: 'Dense Fog & Steady Showers',
    cloudCoverPercent: 98,
    visibilityKm: 0.8,
    timestamp: new Date().toISOString()
  },
  'Aizawl': {
    district: 'Aizawl',
    state: 'Mizoram',
    temperature: 21.0,
    humidity: 86,
    windSpeed: 11.5,
    windDirection: 'SSE',
    barometricPressureHpa: 1011.0,
    condition: 'Overcast & Moderate Drizzle',
    cloudCoverPercent: 85,
    visibilityKm: 4.2,
    timestamp: new Date().toISOString()
  },
  'Kohima': {
    district: 'Kohima',
    state: 'Nagaland',
    temperature: 19.4,
    humidity: 87,
    windSpeed: 10.0,
    windDirection: 'SE',
    barometricPressureHpa: 1011.8,
    condition: 'Cloudy with Light Rain',
    cloudCoverPercent: 88,
    visibilityKm: 6.0,
    timestamp: new Date().toISOString()
  },
  'North Tripura': {
    district: 'North Tripura',
    state: 'Tripura',
    temperature: 28.5,
    humidity: 71,
    windSpeed: 8.0,
    windDirection: 'SW',
    barometricPressureHpa: 1014.2,
    condition: 'Partly Cloudy & Dry',
    cloudCoverPercent: 40,
    visibilityKm: 9.0,
    timestamp: new Date().toISOString()
  }
};

// Generate realistic 24-hour timeline history for each district
function createHourlyHistory(baseRain24h: number, baseRate: number): HourlyRainfallRecord[] {
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00', 
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];
  let cumulative = 0;
  return hours.map((h, i) => {
    const factor = Math.sin((i / 11) * Math.PI) * 0.8 + 0.5;
    const hourRain = Number(((baseRain24h / 12) * factor).toFixed(1));
    cumulative += hourRain;
    const intensity = Number((hourRain * 0.85 + (i === 11 ? baseRate : 0)).toFixed(1));
    
    let th: 'Normal' | 'Watch' | 'Warning' | 'Danger' = 'Normal';
    if (cumulative > 130 || intensity > 20) th = 'Danger';
    else if (cumulative > 70 || intensity > 10) th = 'Warning';
    else if (cumulative > 35) th = 'Watch';

    return {
      hour: h,
      rainfallMm: hourRain,
      cumulative24hMm: Number(cumulative.toFixed(1)),
      intensityMmHr: intensity,
      temperatureC: 18 + Math.sin(i / 3) * 3,
      thresholdLevel: th
    };
  });
}

export const MOCK_RAW_RAINFALL: Record<string, RawRainfallData> = {
  'East Khasi Hills': {
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    currentRainfallMmHr: 28.5,
    rainfall24hMm: 188.0,
    rainfall7dMm: 560.0,
    hourlyHistory: createHourlyHistory(188.0, 28.5),
    lastMeasurementTime: new Date().toISOString()
  },
  'Pakyong': {
    district: 'Pakyong',
    state: 'Sikkim',
    currentRainfallMmHr: 16.4,
    rainfall24hMm: 142.5,
    rainfall7dMm: 412.0,
    hourlyHistory: createHourlyHistory(142.5, 16.4),
    lastMeasurementTime: new Date().toISOString()
  },
  'Noney': {
    district: 'Noney',
    state: 'Manipur',
    currentRainfallMmHr: 22.0,
    rainfall24hMm: 156.0,
    rainfall7dMm: 475.0,
    hourlyHistory: createHourlyHistory(156.0, 22.0),
    lastMeasurementTime: new Date().toISOString()
  },
  'Dima Hasao': {
    district: 'Dima Hasao',
    state: 'Assam',
    currentRainfallMmHr: 8.5,
    rainfall24hMm: 98.4,
    rainfall7dMm: 290.0,
    hourlyHistory: createHourlyHistory(98.4, 8.5),
    lastMeasurementTime: new Date().toISOString()
  },
  'West Kameng': {
    district: 'West Kameng',
    state: 'Arunachal Pradesh',
    currentRainfallMmHr: 12.0,
    rainfall24hMm: 128.0,
    rainfall7dMm: 380.5,
    hourlyHistory: createHourlyHistory(128.0, 12.0),
    lastMeasurementTime: new Date().toISOString()
  },
  'Aizawl': {
    district: 'Aizawl',
    state: 'Mizoram',
    currentRainfallMmHr: 6.2,
    rainfall24hMm: 82.0,
    rainfall7dMm: 240.0,
    hourlyHistory: createHourlyHistory(82.0, 6.2),
    lastMeasurementTime: new Date().toISOString()
  },
  'Kohima': {
    district: 'Kohima',
    state: 'Nagaland',
    currentRainfallMmHr: 5.0,
    rainfall24hMm: 76.5,
    rainfall7dMm: 210.0,
    hourlyHistory: createHourlyHistory(76.5, 5.0),
    lastMeasurementTime: new Date().toISOString()
  },
  'North Tripura': {
    district: 'North Tripura',
    state: 'Tripura',
    currentRainfallMmHr: 0.0,
    rainfall24hMm: 22.0,
    rainfall7dMm: 65.0,
    hourlyHistory: createHourlyHistory(22.0, 0.0),
    lastMeasurementTime: new Date().toISOString()
  }
};

// 5-Day Forecast series
function createForecastDays(f24: number, f72: number): DailyForecastRecord[] {
  const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  return days.map((d, idx) => {
    const rain = idx === 0 ? f24 : Math.max(5, Math.round(f72 * (0.45 - idx * 0.08)));
    let th: 'Normal' | 'Watch' | 'Warning' | 'Danger' = 'Normal';
    if (rain > 120) th = 'Danger';
    else if (rain > 65) th = 'Warning';
    else if (rain > 30) th = 'Watch';

    return {
      date: `2026-09-${String(6 + idx).padStart(2, '0')}`,
      dayName: d,
      rainfallExpectedMm: rain,
      maxRainfallIntensityMmHr: Number((rain / 8).toFixed(1)),
      temperatureMaxC: 22 - idx * 0.5,
      temperatureMinC: 15 - idx * 0.5,
      condition: rain > 100 ? 'Severe Storm' : rain > 50 ? 'Heavy Showers' : rain > 20 ? 'Scattered Rain' : 'Partly Cloudy',
      hazardRiskProbability: Math.min(98, Math.round(rain * 0.65)),
      thresholdLevel: th
    };
  });
}

export const MOCK_RAW_FORECAST: Record<string, RawForecastData> = {
  'East Khasi Hills': {
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    forecast24hMm: 165.0,
    forecast72hMm: 380.0,
    dailyForecasts: createForecastDays(165.0, 380.0),
    issuedAt: new Date().toISOString()
  },
  'Pakyong': {
    district: 'Pakyong',
    state: 'Sikkim',
    forecast24hMm: 120.0,
    forecast72hMm: 295.0,
    dailyForecasts: createForecastDays(120.0, 295.0),
    issuedAt: new Date().toISOString()
  },
  'Noney': {
    district: 'Noney',
    state: 'Manipur',
    forecast24hMm: 135.0,
    forecast72hMm: 310.0,
    dailyForecasts: createForecastDays(135.0, 310.0),
    issuedAt: new Date().toISOString()
  },
  'Dima Hasao': {
    district: 'Dima Hasao',
    state: 'Assam',
    forecast24hMm: 75.0,
    forecast72hMm: 180.0,
    dailyForecasts: createForecastDays(75.0, 180.0),
    issuedAt: new Date().toISOString()
  },
  'West Kameng': {
    district: 'West Kameng',
    state: 'Arunachal Pradesh',
    forecast24hMm: 95.0,
    forecast72hMm: 230.0,
    dailyForecasts: createForecastDays(95.0, 230.0),
    issuedAt: new Date().toISOString()
  },
  'Aizawl': {
    district: 'Aizawl',
    state: 'Mizoram',
    forecast24hMm: 55.0,
    forecast72hMm: 140.0,
    dailyForecasts: createForecastDays(55.0, 140.0),
    issuedAt: new Date().toISOString()
  },
  'Kohima': {
    district: 'Kohima',
    state: 'Nagaland',
    forecast24hMm: 48.0,
    forecast72hMm: 125.0,
    dailyForecasts: createForecastDays(48.0, 125.0),
    issuedAt: new Date().toISOString()
  },
  'North Tripura': {
    district: 'North Tripura',
    state: 'Tripura',
    forecast24hMm: 15.0,
    forecast72hMm: 45.0,
    dailyForecasts: createForecastDays(15.0, 45.0),
    issuedAt: new Date().toISOString()
  }
};
