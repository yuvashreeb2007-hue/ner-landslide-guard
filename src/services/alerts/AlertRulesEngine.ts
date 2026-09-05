/**
 * Alert Rules Engine for NER LandslideGuard
 * Evaluates geotechnical risk scores, hydrological precipitation, soil moisture,
 * IoT sensor statuses, historical activity, and verified field reports.
 */

import {
  AlertSeverity,
  RuleDefinition,
  RuleEvaluationInput,
  RuleEvaluationResult
} from './types';

// Standard Alert Rules Definitions
export const STANDARD_ALERT_RULES: RuleDefinition[] = [
  {
    id: 'RULE-01-CRIT-RISK',
    name: 'Critical AI Risk Score Threshold',
    category: 'RISK_SCORE',
    description: 'Triggers a CRITICAL alert when composite geotechnical risk score reaches 80 or above.',
    conditionDescription: 'riskScore >= 80',
    severityTarget: 'CRITICAL',
    weight: 95,
    enabled: true,
  },
  {
    id: 'RULE-02-WARN-RISK',
    name: 'Elevated Risk Score Warning',
    category: 'RISK_SCORE',
    description: 'Triggers a WARNING/DANGER alert when composite geotechnical risk score is between 60 and 79.',
    conditionDescription: 'riskScore >= 60 and riskScore < 80',
    severityTarget: 'WARNING',
    weight: 70,
    enabled: true,
  },
  {
    id: 'RULE-03-EXTREME-RAIN',
    name: 'Torrential 24h Rainfall Surge',
    category: 'RAINFALL',
    description: 'Increases alert level to DANGER/CRITICAL when 24-hour rainfall exceeds regional landslide threshold (>120mm).',
    conditionDescription: 'rainfall24h > 120 mm',
    severityTarget: 'CRITICAL',
    weight: 85,
    enabled: true,
  },
  {
    id: 'RULE-04-HIGH-RAIN',
    name: 'Heavy 24h Rainfall Escalation',
    category: 'RAINFALL',
    description: 'Escalates alert level by +1 tier when 24h rainfall exceeds 70mm on vulnerable slopes.',
    conditionDescription: 'rainfall24h > 70 mm and slope > 25°',
    severityTarget: 'DANGER',
    weight: 65,
    enabled: true,
  },
  {
    id: 'RULE-05-SOIL-SATURATION',
    name: 'Critical Soil Moisture & Liquefaction Limit',
    category: 'SOIL_MOISTURE',
    description: 'Escalates alert level when in-situ soil moisture saturation exceeds 85%, indicating pore-water liquefaction risk.',
    conditionDescription: 'soilMoisture >= 85%',
    severityTarget: 'DANGER',
    weight: 75,
    enabled: true,
  },
  {
    id: 'RULE-06-SENSOR-CRITICAL',
    name: 'IoT Geotechnical Sensor Trigger',
    category: 'SENSOR',
    description: 'Immediately raises CRITICAL/DANGER alert if an inclinometer, piezometer, or extensometer exceeds safety limit.',
    conditionDescription: 'sensorStatus == CRITICAL (Tilt > 3.5° or Displacement > 10mm)',
    severityTarget: 'CRITICAL',
    weight: 90,
    enabled: true,
  },
  {
    id: 'RULE-07-VERIFIED-REPORT-BOOST',
    name: 'Verified Citizen/Field Report Inside High-Risk Zone',
    category: 'FIELD_REPORT',
    description: 'Increases priority and alert tier when a verified ground report confirms active tension cracks or minor slip.',
    conditionDescription: 'verifiedReportsCount >= 1 in zone with riskScore >= 50',
    severityTarget: 'DANGER',
    weight: 80,
    enabled: true,
  },
  {
    id: 'RULE-08-STEEP-SLOPE-MULTIPLIER',
    name: 'Steep Escarpment Precipitation Multiplier',
    category: 'COMPOUND',
    description: 'Compounds alert severity when steep slope (>35°) combines with sustained 7-day antecedent precipitation (>150mm).',
    conditionDescription: 'slope > 35° and rainfall7d > 150 mm',
    severityTarget: 'WARNING',
    weight: 60,
    enabled: true,
  },
];

const SEVERITY_RANKS: Record<AlertSeverity, number> = {
  INFO: 0,
  WATCH: 1,
  WARNING: 2,
  DANGER: 3,
  CRITICAL: 4,
};

const SEVERITY_FROM_RANK: Record<number, AlertSeverity> = {
  0: 'INFO',
  1: 'WATCH',
  2: 'WARNING',
  3: 'DANGER',
  4: 'CRITICAL',
};

export class AlertRulesEngine {
  private rules: RuleDefinition[];

  constructor(customRules?: RuleDefinition[]) {
    this.rules = customRules || STANDARD_ALERT_RULES;
  }

  public getRules(): RuleDefinition[] {
    return [...this.rules];
  }

  public toggleRule(ruleId: string, enabled: boolean): void {
    this.rules = this.rules.map(r => (r.id === ruleId ? { ...r, enabled } : r));
  }

  /**
   * Evaluates input parameters against all active rules and determines the composite alert level
   */
  public evaluate(input: RuleEvaluationInput): RuleEvaluationResult {
    const matchedRules: string[] = [];
    const reasons: string[] = [];
    let currentRank = 0; // Starts at INFO

    const isRuleEnabled = (id: string) => {
      const found = this.rules.find(r => r.id === id);
      return found ? found.enabled : true;
    };

    // 1. Base Risk Score Rules
    if (input.riskScore >= 80 && isRuleEnabled('RULE-01-CRIT-RISK')) {
      currentRank = Math.max(currentRank, SEVERITY_RANKS.CRITICAL);
      matchedRules.push('RULE-01-CRIT-RISK (Risk Score >= 80)');
      reasons.push(`Composite AI landslide risk score is critical (${input.riskScore}/100)`);
    } else if (input.riskScore >= 60 && isRuleEnabled('RULE-02-WARN-RISK')) {
      currentRank = Math.max(currentRank, SEVERITY_RANKS.WARNING);
      matchedRules.push('RULE-02-WARN-RISK (Risk Score >= 60)');
      reasons.push(`High risk index (${input.riskScore}/100) on vulnerable geological formation`);
    } else if (input.riskScore >= 40) {
      currentRank = Math.max(currentRank, SEVERITY_RANKS.WATCH);
      reasons.push(`Moderate risk score (${input.riskScore}/100) under geotechnical surveillance`);
    } else if (input.riskScore >= 20) {
      currentRank = Math.max(currentRank, SEVERITY_RANKS.INFO);
    }

    // 2. Rainfall 24h Threshold Gates
    if (input.rainfall24h > 120 && isRuleEnabled('RULE-03-EXTREME-RAIN')) {
      // Torrential precipitation -> Escalates up to CRITICAL
      currentRank = Math.max(currentRank, SEVERITY_RANKS.DANGER);
      currentRank = Math.min(4, currentRank + 1); // +1 tier boost
      matchedRules.push('RULE-03-EXTREME-RAIN (24h Rainfall > 120mm)');
      reasons.push(`Extreme 24h precipitation (${input.rainfall24h.toFixed(1)} mm) exceeding cloudburst saturation limit`);
    } else if (input.rainfall24h > 70 && input.slope > 25 && isRuleEnabled('RULE-04-HIGH-RAIN')) {
      currentRank = Math.max(currentRank, SEVERITY_RANKS.WARNING);
      currentRank = Math.min(4, currentRank + 1);
      matchedRules.push('RULE-04-HIGH-RAIN (24h Rainfall > 70mm on Steep Slope)');
      reasons.push(`Heavy 24h rainfall (${input.rainfall24h.toFixed(1)} mm) acting on steep slope (${input.slope.toFixed(1)}°)`);
    }

    // 3. Soil Moisture & Liquefaction Threshold
    if (input.soilMoisture >= 85 && isRuleEnabled('RULE-05-SOIL-SATURATION')) {
      currentRank = Math.max(currentRank, SEVERITY_RANKS.DANGER);
      matchedRules.push('RULE-05-SOIL-SATURATION (Soil Moisture >= 85%)');
      reasons.push(`Critical soil saturation (${input.soilMoisture.toFixed(1)}%) with elevated pore-water pressure`);
    } else if (input.soilMoisture >= 75) {
      if (currentRank >= SEVERITY_RANKS.WATCH) {
        currentRank = Math.min(4, currentRank + 1);
      }
      reasons.push(`High soil moisture (${input.soilMoisture.toFixed(1)}%) reducing slope shear strength`);
    }

    // 4. Critical Sensor Trigger
    if (input.criticalSensorTriggered && isRuleEnabled('RULE-06-SENSOR-CRITICAL')) {
      currentRank = Math.max(currentRank, SEVERITY_RANKS.CRITICAL);
      matchedRules.push('RULE-06-SENSOR-CRITICAL (Geotechnical Sensor Threshold Exceeded)');
      
      const sensorDetailStr = input.sensorDetails && input.sensorDetails.length > 0
        ? input.sensorDetails.map(s => `${s.type} (${s.value} vs safety limit ${s.threshold})`).join(', ')
        : 'Inclinometer angular tilt & ground extensometer exceeded critical limits';
      reasons.push(`Active IoT sensor alarm: ${sensorDetailStr}`);
    }

    // 5. Verified Field Report Boost
    if ((input.verifiedFieldReportsCount || 0) >= 1 && input.riskScore >= 50 && isRuleEnabled('RULE-07-VERIFIED-REPORT-BOOST')) {
      currentRank = Math.min(4, currentRank + 1); // +1 boost
      matchedRules.push(`RULE-07-VERIFIED-REPORT-BOOST (${input.verifiedFieldReportsCount} Verified Ground Report(s))`);
      reasons.push(`${input.verifiedFieldReportsCount} verified field report(s) confirm ground fissuring or active slope movement`);
    }

    // 6. Steep Slope Compounder
    if (input.slope > 35 && (input.rainfall7d || 0) > 150 && isRuleEnabled('RULE-08-STEEP-SLOPE-MULTIPLIER')) {
      if (currentRank < SEVERITY_RANKS.WARNING) {
        currentRank = SEVERITY_RANKS.WARNING;
      }
      matchedRules.push('RULE-08-STEEP-SLOPE-MULTIPLIER (Slope > 35° & 7d Rain > 150mm)');
      reasons.push(`Cumulative 7-day rainfall (${(input.rainfall7d || 0).toFixed(1)} mm) on acute escarpment (${input.slope.toFixed(1)}°)`);
    }

    const finalSeverity = SEVERITY_FROM_RANK[currentRank] || 'INFO';
    const triggered = currentRank >= SEVERITY_RANKS.WATCH;

    // Build human-friendly titles, messages, and recommended actions based on severity
    let title = '';
    let recommendedAction = '';
    let message = '';

    switch (finalSeverity) {
      case 'CRITICAL':
        title = `CRITICAL LANDSLIDE WARNING: Immediate Slope Failure Threat in ${input.district}`;
        message = `Catastrophic landslide risk detected for ${input.location} (${input.district}, ${input.state}). Multi-parameter geotechnical sensors and hydrological models indicate imminent shear failure.`;
        recommendedAction = 'Mandatory immediate evacuation of valley and toe settlements to designated higher shelters. Halt all national highway traffic. Mobilize NDRF/SDRF emergency search & rescue teams.';
        break;
      case 'DANGER':
        title = `DANGER ADVISORY: Severe Geotechnical Destabilization in ${input.district}`;
        message = `High likelihood of rockfalls, debris flows, and road embankment subsidence near ${input.location}.`;
        recommendedAction = 'Issue pre-evacuation alert to vulnerable households. Deploy police checkposts to restrict transit. Activate district emergency operations center (DEOC).';
        break;
      case 'WARNING':
        title = `LANDSLIDE WARNING: Heavy Rainfall & Elevated Risk in ${input.district}`;
        message = `Sustained precipitation has pushed slope stability to warning thresholds in ${input.location}.`;
        recommendedAction = 'Advise residents to avoid steep cut-slopes and stream gullies. Put road clearance equipment and BRO teams on standby.';
        break;
      case 'WATCH':
        title = `LANDSLIDE WATCH: Saturated Soil & Moderate Vulnerability in ${input.district}`;
        message = `Weather stations report persistent rainfall with rising soil moisture profiles in ${input.location}.`;
        recommendedAction = 'Monitor live IoT sensor telemetry. Restrict non-essential heavy transport on mountain corridors.';
        break;
      case 'INFO':
      default:
        title = `ROUTINE MONITORING: Normal Geotechnical Conditions in ${input.district}`;
        message = `All slope stability sensors and meteorological indicators within safe operating parameters for ${input.location}.`;
        recommendedAction = 'Continue routine telemetry polling and automated model evaluation.';
        break;
    }

    // Estimate affected population
    const basePop = input.populationExposed || 4500;
    const popMultiplier = finalSeverity === 'CRITICAL' ? 1.0 : finalSeverity === 'DANGER' ? 0.75 : finalSeverity === 'WARNING' ? 0.5 : 0.25;
    const affectedPopulation = Math.round(basePop * popMultiplier);

    const consolidatedReason = reasons.length > 0
      ? reasons.join('. ') + '.'
      : 'Geotechnical indices within regular baseline parameters.';

    return {
      triggered,
      severity: finalSeverity,
      title,
      message,
      reason: consolidatedReason,
      recommendedAction,
      affectedPopulation,
      matchedRules,
    };
  }
}

export const alertRulesEngine = new AlertRulesEngine();
