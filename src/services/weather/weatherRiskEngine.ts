import { 
  RainfallThresholdLevel, 
  RainfallIntensityCategory 
} from './types';

export interface WeatherRiskEvaluation {
  thresholdLevel: RainfallThresholdLevel;
  description: string;
  actionRequired: string;
  triggerStatus: 'Normal' | 'Exceeded Watch' | 'Exceeded Warning' | 'Critical Danger Breached';
  saturationIndex: number; // 0.0 - 1.0
  scoreMultiplier: number; // 1.0 - 1.85
  calculatedRiskScore: number; // 0 - 100
  landslideProbability: number; // 0.0 - 1.0
  contributingAlert: string;
}

/**
 * Weather & Rainfall Threshold Risk Engine
 * Evaluates in-situ rainfall rate, 24h antecedent rainfall, and 7-day cumulative saturation
 * against IMD and Geological Survey of India (GSI) hazard trigger thresholds.
 */
export class WeatherRiskEngine {
  /**
   * Determine rainfall intensity category from hourly precipitation rate.
   */
  public static getIntensityCategory(rateMmHr: number): RainfallIntensityCategory {
    if (rateMmHr <= 0.1) return 'None';
    if (rateMmHr < 2.5) return 'Light (<2.5 mm/hr)';
    if (rateMmHr < 7.5) return 'Moderate (2.5-7.5 mm/hr)';
    if (rateMmHr < 15.0) return 'Heavy (7.5-15 mm/hr)';
    if (rateMmHr <= 30.0) return 'Very Heavy (15-30 mm/hr)';
    return 'Cloudburst (>30 mm/hr)';
  }

  /**
   * Evaluates rainfall conditions to produce threshold level and risk amplification.
   */
  public static evaluateRisk(
    rainfall24h: number,
    rainfall7d: number,
    currentRateMmHr: number,
    baseTerrainRisk: number = 50
  ): WeatherRiskEvaluation {
    // 1. Calculate Saturation Index (0.0 to 1.0)
    // 7d rain above 400mm and 24h rain above 120mm drive saturation to near 100%
    const sat7d = Math.min(1.0, rainfall7d / 500.0);
    const sat24h = Math.min(1.0, rainfall24h / 160.0);
    const saturationIndex = Number((sat7d * 0.45 + sat24h * 0.55).toFixed(2));

    // 2. Determine 4-Tier Rainfall Threshold Level
    // Danger: 24h > 130mm OR Rate > 25mm/hr OR (24h > 100mm and 7d > 350mm)
    // Warning: 24h > 70mm OR Rate > 12mm/hr OR 7d > 250mm
    // Watch: 24h > 35mm OR Rate > 5mm/hr
    // Normal: Otherwise
    let thresholdLevel: RainfallThresholdLevel = 'Normal';
    let triggerStatus: 'Normal' | 'Exceeded Watch' | 'Exceeded Warning' | 'Critical Danger Breached' = 'Normal';
    let description = '';
    let actionRequired = '';
    let scoreMultiplier = 1.0;

    if (rainfall24h >= 130 || currentRateMmHr >= 25 || (rainfall24h >= 100 && rainfall7d >= 350)) {
      thresholdLevel = 'Danger';
      triggerStatus = 'Critical Danger Breached';
      description = `Critical rainfall threshold breached (${rainfall24h.toFixed(1)} mm/24h). Severe pore pressure build-up and slope failure imminent.`;
      actionRequired = 'Activate CAP Community Sirens. Evacuate toe settlements and halt all highway traffic.';
      scoreMultiplier = 1.75;
    } else if (rainfall24h >= 70 || currentRateMmHr >= 12 || rainfall7d >= 250) {
      thresholdLevel = 'Warning';
      triggerStatus = 'Exceeded Warning';
      description = `Heavy precipitation advisory active (${rainfall24h.toFixed(1)} mm/24h). Elevated shear stress along steep highway cuts.`;
      actionRequired = 'Issue Orange Warning. Deploy road clearing patrols and restrict heavy freight.';
      scoreMultiplier = 1.45;
    } else if (rainfall24h >= 35 || currentRateMmHr >= 5 || rainfall7d >= 140) {
      thresholdLevel = 'Watch';
      triggerStatus = 'Exceeded Watch';
      description = `Moderate precipitation watch (${rainfall24h.toFixed(1)} mm/24h). Soil saturation progressively increasing.`;
      actionRequired = 'Issue Yellow Advisory. Inspect roadside culverts and drainage channels.';
      scoreMultiplier = 1.20;
    } else {
      thresholdLevel = 'Normal';
      triggerStatus = 'Normal';
      description = `Rainfall within stable baseline parameters (${rainfall24h.toFixed(1)} mm/24h).`;
      actionRequired = 'Maintain routine automated meteorological logging and sensor telemetry.';
      scoreMultiplier = 1.0;
    }

    // 3. Dynamic Landslide Risk Calculation
    // Multiplies baseline slope vulnerability with rainfall saturation index and intensity boost
    const dynamicScore = Math.min(
      100,
      Math.max(
        10,
        Math.round(baseTerrainRisk * scoreMultiplier + saturationIndex * 20 + currentRateMmHr * 0.5)
      )
    );
    const landslideProbability = Number((dynamicScore / 100.0).toFixed(2));

    const contributingAlert = 
      thresholdLevel === 'Danger'
        ? `Extreme Rainfall Infiltration (${rainfall24h.toFixed(1)}mm 24h)`
        : thresholdLevel === 'Warning'
        ? `Heavy Rain Inundation (${rainfall24h.toFixed(1)}mm 24h)`
        : thresholdLevel === 'Watch'
        ? `Elevated Antecedent Moisture`
        : `Stable Meteorological Baseline`;

    return {
      thresholdLevel,
      description,
      actionRequired,
      triggerStatus,
      saturationIndex,
      scoreMultiplier,
      calculatedRiskScore: dynamicScore,
      landslideProbability,
      contributingAlert
    };
  }
}
