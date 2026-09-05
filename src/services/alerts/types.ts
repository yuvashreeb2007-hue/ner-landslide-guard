/**
 * Types and Interfaces for NER LandslideGuard Alert Engine
 */

import { NERState } from '@/types';

export type AlertSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'DANGER' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'ESCALATED' | 'DISPATCHED' | 'RESOLVED';

export type DeliveryChannelType = 'APP' | 'SMS' | 'PUSH';

export type DeliveryStatus = 'DELIVERED' | 'FAILED' | 'PENDING' | 'IN_TRANSIT';

export interface DeliveryLogEntry {
  channel: DeliveryChannelType;
  providerName: string;
  status: DeliveryStatus;
  timestamp: string;
  recipientCount: number;
  latencyMs: number;
  details?: string;
}

export interface AlertObject {
  id: string;
  severity: AlertSeverity;
  title: string;
  district: string;
  state: NERState;
  location: string;
  latitude: number;
  longitude: number;
  message: string;
  reason: string;
  createdAt: string;
  validUntil: string;
  affectedPopulation: number;
  recommendedAction: string;
  status: AlertStatus;
  triggerRules: string[];
  telemetrySnapshot: {
    riskScore: number;
    rainfall24h: number;
    rainfall7d?: number;
    soilMoisture: number;
    slope: number;
    elevation?: number;
    criticalSensorTriggered: boolean;
    sensorTriggers: string[];
    verifiedReportsCount: number;
    historicalLandslideCount?: number;
  };
  deliveryLog: DeliveryLogEntry[];
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  escalatedTo?: string;
  escalatedAt?: string;
  dispatchedTeams?: string[];
  dispatchedAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface RuleEvaluationInput {
  zoneId?: string;
  district: string;
  state: NERState;
  location: string;
  latitude: number;
  longitude: number;
  riskScore: number; // 0 - 100
  rainfall24h: number; // mm
  rainfall7d?: number; // mm
  soilMoisture: number; // %
  slope: number; // degrees
  elevation?: number; // meters
  criticalSensorTriggered?: boolean;
  sensorDetails?: Array<{
    id: string;
    type: string;
    value: number;
    threshold: number;
    status: string;
  }>;
  historicalActivityCount?: number;
  verifiedFieldReportsCount?: number;
  populationExposed?: number;
}

export interface RuleEvaluationResult {
  triggered: boolean;
  severity: AlertSeverity;
  title: string;
  message: string;
  reason: string;
  recommendedAction: string;
  affectedPopulation: number;
  matchedRules: string[];
}

export interface RuleDefinition {
  id: string;
  name: string;
  category: 'RISK_SCORE' | 'RAINFALL' | 'SOIL_MOISTURE' | 'SENSOR' | 'FIELD_REPORT' | 'COMPOUND';
  description: string;
  conditionDescription: string;
  severityTarget: AlertSeverity;
  weight: number;
  enabled: boolean;
}

export interface NotificationPayload {
  alertId: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  location: string;
  district: string;
  state: string;
  recommendedAction: string;
  timestamp: string;
}

export interface DeliveryResult {
  channel: DeliveryChannelType;
  providerName: string;
  success: boolean;
  recipientCount: number;
  latencyMs: number;
  messageId: string;
  timestamp: string;
  error?: string;
}
