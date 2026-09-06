/**
 * Types and Interfaces for Emergency Response Prioritization & Tactical Dispatch
 */

import { NERState, RiskLevel, RoadStatus } from '@/types';

export type PriorityTier = 'P1' | 'P2' | 'P3' | 'P4';

export type PriorityTierLabel = 'IMMEDIATE' | 'URGENT' | 'HIGH' | 'MONITOR';

export interface PriorityScoreBreakdown {
  riskScoreContribution: number;       // Weight 25% (0 - 25)
  populationContribution: number;      // Weight 20% (0 - 20)
  roadStatusContribution: number;      // Weight 20% (0 - 20)
  distanceContribution: number;        // Weight 10% (0 - 10)
  severityContribution: number;        // Weight 10% (0 - 10)
  affectedVillagesContribution: number;// Weight 10% (0 - 10)
  weatherContribution: number;         // Weight 5%  (0 - 5)
  rawTotal: number;                    // Composite 0 - 100
}

export interface EmergencyPriorityScore {
  score: number; // 0 - 100
  tier: PriorityTier;
  tierLabel: PriorityTierLabel;
  urgencyDescription: string;
  breakdown: PriorityScoreBreakdown;
  keyDrivers: string[];
}

export interface EmergencyTeam {
  id: string;
  name: string;
  unit: string;
  baseLocation: string;
  state: NERState;
  latitude: number;
  longitude: number;
  personnelCount: number;
  status: 'Standing By' | 'Deployed' | 'In Transit' | 'Demobilizing';
  specialization: 'Mountain Search & Rescue' | 'Heavy Debris Clearing' | 'Swift Water & Mudflow' | 'Medical First Response' | 'Evacuation Logistics';
  equipment: string[];
  contactOfficer: string;
  contactPhone: string;
  assignedIncidentId?: string;
  activeDispatchesCount: number;
}

export interface PrioritizedIncident {
  id: string;
  title: string;
  district: string;
  state: NERState;
  location: string;
  latitude: number;
  longitude: number;
  elevation: number;
  hazardType: string;
  severity: RiskLevel;
  riskScore: number; // 0 - 100
  affectedPopulation: number;
  reportedTime: string;
  status: 'Active' | 'Under Review' | 'Response Dispatched' | 'Resolved' | 'Monitoring';
  description: string;
  recommendedAction: string;
  
  // Road & Infrastructure Context
  roadName: string;
  roadStatus: RoadStatus;
  roadBlockageDistanceKm?: number;
  detourAvailable: boolean;

  // Community Context
  affectedVillages: Array<{
    name: string;
    population: number;
    isolationRisk: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    evacuationCenterName: string;
  }>;

  // Weather & Hydro Context
  rainfall24hMm: number;
  rainfallIntensityMmHr: number;
  weatherCondition: string;

  // Calculated Emergency Priority
  priority: EmergencyPriorityScore;

  // Dynamic Dispatch & ETA
  nearestTeamDistanceKm: number;
  estimatedEtaMinutes: number;
  assignedTeamId?: string;
  assignedTeamName?: string;
  dispatchedAt?: string;
}

export interface IncidentRelationshipChain {
  incident: {
    id: string;
    name: string;
    type: string;
    severity: RiskLevel;
    priorityTier: PriorityTier;
    priorityScore: number;
    coordinates: string;
  };
  road: {
    id: string;
    name: string;
    route: string;
    status: RoadStatus;
    impactDescription: string;
  };
  village: {
    primaryVillage: string;
    count: number;
    allVillages: string[];
    evacuationCenter: string;
  };
  population: {
    totalExposed: number;
    highRiskCount: number;
    evacuatedCount: number;
  };
  responseTeam: {
    teamId: string;
    teamName: string;
    unit: string;
    baseLocation: string;
    personnelCount: number;
    status: string;
    etaMinutes: number;
  };
}

export interface ReliefCamp {
  id: string;
  name: string;
  district: string;
  state: NERState;
  capacity: number;
  currentOccupancy: number;
  medicalTeam: string;
  foodWaterStatus: string;
  powerBackup: boolean;
  contactOfficer: string;
  contactPhone: string;
}
