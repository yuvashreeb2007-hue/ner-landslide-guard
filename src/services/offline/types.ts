/**
 * Types and Interfaces for Low-Network & Offline Support Engine
 */

import { NERState } from '@/types';
import { ReportIncidentType, ReportSeverity, ReporterType } from '@/services/reporting/types';

export type NetworkConnectionState = 'ONLINE' | 'OFFLINE' | 'SYNCING';

export type QueueItemStatus = 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface QueuedFieldReport {
  id: string; // e.g. OFFLINE-REP-2026-4192
  createdAt: string;
  incidentType: ReportIncidentType;
  description: string;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  district: string;
  state: NERState;
  village: string;
  roadBlocked: boolean;
  structuresAtRisk?: number;
  photoUrl?: string;
  reporterType: ReporterType;
  reporterName?: string;
  contactPhone?: string;
  
  // Offline Sync Metadata
  syncStatus: QueueItemStatus;
  attempts: number;
  lastError?: string;
  syncedAt?: string;
  serverIncidentId?: string;
}

export interface OfflineSyncMetrics {
  totalInQueue: number;
  queuedCount: number;
  syncingCount: number;
  syncedCount: number;
  failedCount: number;
  lastSyncTimestamp?: string;
  networkState: NetworkConnectionState;
  isSimulatedOffline: boolean;
}
