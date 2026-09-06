/**
 * Emergency Response Prioritization Engine
 * Calculates multi-factor Emergency Priority Scores (0-100), assigns P1-P4 urgency classifications,
 * and computes dynamic terrain-adjusted ETAs for rapid disaster response.
 */

import {
  EmergencyPriorityScore,
  PriorityScoreBreakdown,
  PriorityTier,
  PriorityTierLabel
} from './types';
import { RiskLevel, RoadStatus } from '@/types';

export class PrioritizationEngine {
  /**
   * Calculates the 7-factor Emergency Priority Score (EPS) from 0 to 100
   */
  public static calculatePriorityScore(params: {
    riskScore: number;
    populationExposed: number;
    roadStatus: RoadStatus;
    distanceToServicesKm: number;
    severity: RiskLevel;
    affectedVillagesCount: number;
    rainfall24hMm: number;
    rainfallIntensityMmHr?: number;
  }): EmergencyPriorityScore {
    const keyDrivers: string[] = [];

    // 1. Risk score contribution (Weight: 25%)
    const riskScoreContribution = Number(((Math.min(100, Math.max(0, params.riskScore)) / 100) * 25).toFixed(1));
    if (params.riskScore >= 75) {
      keyDrivers.push(`High geotechnical risk index (${params.riskScore}/100)`);
    }

    // 2. Population exposed contribution (Weight: 20%)
    let populationContribution = 0;
    if (params.populationExposed >= 10000) {
      populationContribution = 20;
      keyDrivers.push(`Large population exposed (${params.populationExposed.toLocaleString()} residents)`);
    } else if (params.populationExposed >= 5000) {
      populationContribution = 16.5;
      keyDrivers.push(`Dense settlement exposure (${params.populationExposed.toLocaleString()} residents)`);
    } else if (params.populationExposed >= 2000) {
      populationContribution = 13.0;
    } else if (params.populationExposed >= 500) {
      populationContribution = 9.0;
    } else {
      populationContribution = 5.0;
    }

    // 3. Road connectivity & blockage status (Weight: 20%)
    let roadStatusContribution = 0;
    switch (params.roadStatus) {
      case 'Completely Blocked':
        roadStatusContribution = 20.0;
        keyDrivers.push('Highway corridor completely blocked (Total isolation)');
        break;
      case 'High Risk Warning':
        roadStatusContribution = 16.0;
        keyDrivers.push('High risk of imminent road carriage breach');
        break;
      case 'Partial Lane Open':
        roadStatusContribution = 12.0;
        break;
      case 'Under Clearance':
        roadStatusContribution = 8.0;
        break;
      case 'Clear':
      default:
        roadStatusContribution = 2.0;
        break;
    }

    // 4. Distance to emergency services (Weight: 10%)
    let distanceContribution = 0;
    if (params.distanceToServicesKm >= 45) {
      distanceContribution = 10.0;
      keyDrivers.push(`Remote mountain transit distance (${params.distanceToServicesKm.toFixed(0)} km to base)`);
    } else if (params.distanceToServicesKm >= 25) {
      distanceContribution = 7.5;
    } else if (params.distanceToServicesKm >= 12) {
      distanceContribution = 5.0;
    } else {
      distanceContribution = 2.5;
    }

    // 5. Severity level (Weight: 10%)
    let severityContribution = 0;
    switch (params.severity) {
      case 'CRITICAL':
        severityContribution = 10.0;
        keyDrivers.push('Critical disaster severity tier');
        break;
      case 'HIGH':
        severityContribution = 8.0;
        break;
      case 'MODERATE':
        severityContribution = 5.0;
        break;
      case 'LOW':
      case 'SAFE':
      default:
        severityContribution = 2.0;
        break;
    }

    // 6. Number of affected villages (Weight: 10%)
    let affectedVillagesContribution = 0;
    if (params.affectedVillagesCount >= 5) {
      affectedVillagesContribution = 10.0;
      keyDrivers.push(`Multiple cut-off village clusters (${params.affectedVillagesCount} villages)`);
    } else if (params.affectedVillagesCount >= 3) {
      affectedVillagesContribution = 8.0;
      keyDrivers.push(`${params.affectedVillagesCount} affected village communities`);
    } else if (params.affectedVillagesCount >= 2) {
      affectedVillagesContribution = 6.0;
    } else if (params.affectedVillagesCount === 1) {
      affectedVillagesContribution = 4.0;
    } else {
      affectedVillagesContribution = 1.0;
    }

    // 7. Weather & Rainfall conditions (Weight: 5%)
    let weatherContribution = 0;
    if (params.rainfall24hMm >= 120 || (params.rainfallIntensityMmHr || 0) >= 25) {
      weatherContribution = 5.0;
      keyDrivers.push(`Extreme rainfall (${params.rainfall24hMm.toFixed(0)}mm / 24h)`);
    } else if (params.rainfall24hMm >= 70) {
      weatherContribution = 4.0;
    } else if (params.rainfall24hMm >= 30) {
      weatherContribution = 2.5;
    } else {
      weatherContribution = 1.0;
    }

    const rawTotal = Math.min(
      100,
      Math.max(
        0,
        Number(
          (
            riskScoreContribution +
            populationContribution +
            roadStatusContribution +
            distanceContribution +
            severityContribution +
            affectedVillagesContribution +
            weatherContribution
          ).toFixed(1)
        )
      )
    );

    const breakdown: PriorityScoreBreakdown = {
      riskScoreContribution,
      populationContribution,
      roadStatusContribution,
      distanceContribution,
      severityContribution,
      affectedVillagesContribution,
      weatherContribution,
      rawTotal,
    };

    let tier: PriorityTier = 'P4';
    let tierLabel: PriorityTierLabel = 'MONITOR';
    let urgencyDescription = 'Routine telemetry polling and local authority monitoring';

    if (rawTotal >= 80) {
      tier = 'P1';
      tierLabel = 'IMMEDIATE';
      urgencyDescription = 'Immediate Search & Rescue dispatch required (<30 min operational window)';
    } else if (rawTotal >= 60) {
      tier = 'P2';
      tierLabel = 'URGENT';
      urgencyDescription = 'Urgent deployment of heavy earthmoving machinery & evacuation transport';
    } else if (rawTotal >= 40) {
      tier = 'P3';
      tierLabel = 'HIGH';
      urgencyDescription = 'High priority medical support & relief logistics mobilization';
    } else {
      tier = 'P4';
      tierLabel = 'MONITOR';
      urgencyDescription = 'Standby surveillance & regular patrol checks';
    }

    return {
      score: Math.round(rawTotal),
      tier,
      tierLabel,
      urgencyDescription,
      breakdown,
      keyDrivers,
    };
  }

  /**
   * Calculates terrain and road-condition adjusted Estimated Time of Arrival (ETA in minutes)
   */
  public static calculateDynamicEta(params: {
    distanceKm: number;
    roadStatus: RoadStatus;
    hasHeavyMachinery?: boolean;
    weatherSeverity?: 'HEAVY_RAIN' | 'NORMAL';
  }): number {
    // Base speed for mountain response convoy: 36 km/h (0.6 km/minute)
    let effectiveSpeedKmh = 36.0;

    if (params.roadStatus === 'Completely Blocked') {
      // Must utilize narrow bypass detour or off-road mountain crawl
      effectiveSpeedKmh = 18.0;
    } else if (params.roadStatus === 'Partial Lane Open') {
      effectiveSpeedKmh = 26.0;
    } else if (params.roadStatus === 'High Risk Warning') {
      effectiveSpeedKmh = 28.0;
    }

    if (params.weatherSeverity === 'HEAVY_RAIN') {
      effectiveSpeedKmh *= 0.85; // 15% speed reduction in severe rain
    }

    // Mobilization prep overhead (6 mins for rapid strike, 12 mins for heavy machinery)
    const prepMinutes = params.hasHeavyMachinery ? 12 : 6;
    const transitMinutes = (params.distanceKm / effectiveSpeedKmh) * 60;

    return Math.max(8, Math.round(prepMinutes + transitMinutes));
  }
}
