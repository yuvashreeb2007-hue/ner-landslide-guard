import { 
  RawCurrentWeather, 
  RawRainfallData, 
  RawForecastData, 
  NormalizedWeatherData, 
  DistrictWeatherSummary 
} from './types';
import { NER_DISTRICTS_METADATA } from './weatherData';
import { WeatherRiskEngine } from './weatherRiskEngine';

/**
 * WeatherAdapter
 * Normalizes, enriches, and transforms raw provider data into standard
 * domain objects with derived metrics, intensity classifications, and risk integrations.
 */
export class WeatherAdapter {
  /**
   * Transforms raw current weather, rainfall, and forecast into a complete NormalizedWeatherData structure.
   */
  public static normalize(
    rawWeather: RawCurrentWeather,
    rawRainfall: RawRainfallData,
    rawForecast: RawForecastData
  ): NormalizedWeatherData {
    const meta = NER_DISTRICTS_METADATA.find(
      (m) => m.district.toLowerCase() === rawWeather.district.toLowerCase()
    ) || {
      district: rawWeather.district,
      state: rawWeather.state,
      lat: 26.0,
      lng: 92.5,
      elevation: 950,
      awsStationId: `AWS-${rawWeather.district.substring(0, 3).toUpperCase()}-01`,
      awsStationName: `${rawWeather.district} Automatic Weather Station`,
      batteryLevel: 90
    };

    // Calculate dew point approximation: T - (100 - RH) / 5
    const dewPoint = Number(
      (rawWeather.temperature - (100 - rawWeather.humidity) / 5).toFixed(1)
    );

    // Derive rainfall intensity classification
    const intensityCategory = WeatherRiskEngine.getIntensityCategory(
      rawRainfall.currentRainfallMmHr
    );

    // Evaluate risk and thresholds
    const riskEval = WeatherRiskEngine.evaluateRisk(
      rawRainfall.rainfall24hMm,
      rawRainfall.rainfall7dMm,
      rawRainfall.currentRainfallMmHr
    );

    return {
      district: rawWeather.district,
      state: rawWeather.state,
      coordinates: {
        lat: meta.lat,
        lng: meta.lng,
        elevation: meta.elevation
      },
      currentWeather: {
        temperature: rawWeather.temperature,
        humidity: rawWeather.humidity,
        dewPoint,
        windSpeed: rawWeather.windSpeed,
        windDirection: rawWeather.windDirection,
        pressureHpa: rawWeather.barometricPressureHpa,
        condition: rawWeather.condition,
        cloudCoverPercent: rawWeather.cloudCoverPercent,
        visibilityKm: rawWeather.visibilityKm
      },
      rainfall: {
        currentRateMmHr: rawRainfall.currentRainfallMmHr,
        rainfall24hMm: rawRainfall.rainfall24hMm,
        rainfall7dMm: rawRainfall.rainfall7dMm,
        forecast24hMm: rawForecast.forecast24hMm,
        forecast72hMm: rawForecast.forecast72hMm,
        intensityCategory,
        hourlyHistory: rawRainfall.hourlyHistory,
        dailyForecasts: rawForecast.dailyForecasts
      },
      threshold: {
        level: riskEval.thresholdLevel,
        description: riskEval.description,
        actionRequired: riskEval.actionRequired,
        triggerStatus: riskEval.triggerStatus,
        saturationIndex: riskEval.saturationIndex
      },
      riskImpact: {
        scoreMultiplier: riskEval.scoreMultiplier,
        calculatedRiskScore: riskEval.calculatedRiskScore,
        landslideProbability: riskEval.landslideProbability,
        contributingAlert: riskEval.contributingAlert
      },
      awsStation: {
        stationId: meta.awsStationId,
        stationName: meta.awsStationName,
        isOnline: true,
        batteryLevel: meta.batteryLevel,
        lastTelemetry: rawRainfall.lastMeasurementTime
      }
    };
  }

  /**
   * Generates a concise summary row for multi-district tables and operational lists.
   */
  public static toSummary(normalized: NormalizedWeatherData): DistrictWeatherSummary {
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (normalized.riskImpact.calculatedRiskScore >= 81) riskLevel = 'CRITICAL';
    else if (normalized.riskImpact.calculatedRiskScore >= 61) riskLevel = 'HIGH';
    else if (normalized.riskImpact.calculatedRiskScore >= 31) riskLevel = 'MODERATE';

    return {
      district: normalized.district,
      state: normalized.state,
      currentRainfallMm: normalized.rainfall.currentRateMmHr,
      rainfall24hMm: normalized.rainfall.rainfall24hMm,
      rainfall7dMm: normalized.rainfall.rainfall7dMm,
      forecast24hMm: normalized.rainfall.forecast24hMm,
      forecast72hMm: normalized.rainfall.forecast72hMm,
      temperatureC: normalized.currentWeather.temperature,
      humidityPercent: normalized.currentWeather.humidity,
      intensityCategory: normalized.rainfall.intensityCategory,
      thresholdLevel: normalized.threshold.level,
      riskImpactScore: normalized.riskImpact.calculatedRiskScore,
      riskLevel,
      statusDescription: normalized.threshold.description
    };
  }
}
