/**
 * Offline Report Queue
 * Stores unsynced field hazard reports locally in browser storage during low-network or offline operations.
 * Automatically synchronizes with backend & ReportingService when connectivity is restored.
 */

import { QueuedFieldReport, QueueItemStatus, OfflineSyncMetrics } from './types';
import { FieldReportInput } from '@/services/reporting/types';
import { NERState } from '@/types';
import { networkStatusManager } from './NetworkStatusManager';
import { reportingService } from '@/services/reporting/ReportingService';

const STORAGE_KEY = 'ner_landslideguard_offline_queue_v1';

const INITIAL_DEMO_QUEUE: QueuedFieldReport[] = [
  {
    id: 'OFFLINE-REP-2026-8912',
    createdAt: '12 Mins Ago (10:02 IST)',
    incidentType: 'Landslide',
    description: 'Fresh debris slide blocking single lane near 18th Mile NH-10. Mudflow actively dripping from cut slope.',
    severity: 'HIGH',
    latitude: 27.198,
    longitude: 88.512,
    district: 'Pakyong',
    state: 'Sikkim',
    village: '18th Mile Settlement',
    roadBlocked: true,
    structuresAtRisk: 2,
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    reporterType: 'Field Officer',
    reporterName: 'Karma Bhutia (SDRF Patrol)',
    contactPhone: '+91 98450 11920',
    syncStatus: 'QUEUED',
    attempts: 0,
  },
  {
    id: 'OFFLINE-REP-2026-7431',
    createdAt: '35 Mins Ago (09:40 IST)',
    incidentType: 'Crack',
    description: 'Horizontal tensile crack opening across concrete culvert apron along SH-5 Cherrapunji route.',
    severity: 'MODERATE',
    latitude: 25.321,
    longitude: 91.718,
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    village: 'Mawkdok Approach',
    roadBlocked: false,
    structuresAtRisk: 1,
    reporterType: 'Citizen',
    reporterName: 'Elgiva Marbaniang',
    contactPhone: '+91 94360 44120',
    syncStatus: 'SYNCED',
    attempts: 1,
    syncedAt: '09:45 IST',
    serverIncidentId: 'REP-2026-ML-7431',
  },
];

export class OfflineReportQueue {
  private queue: QueuedFieldReport[] = [];
  private listeners: Set<() => void> = new Set();
  private isAutoSyncing: boolean = false;

  constructor() {
    this.loadFromStorage();

    // Auto-sync listener on network reconnection
    networkStatusManager.subscribe((state) => {
      if (state === 'ONLINE' && !this.isAutoSyncing) {
        const hasPending = this.queue.some((i) => i.syncStatus === 'QUEUED' || i.syncStatus === 'FAILED');
        if (hasPending) {
          console.log('[OfflineReportQueue] Network restored. Triggering auto-sync for queued reports...');
          this.syncAll();
        }
      }
    });
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      } else {
        this.queue = [...INITIAL_DEMO_QUEUE];
        this.saveToStorage();
      }
    } catch (err) {
      console.warn('[OfflineReportQueue] Failed to load offline queue from storage:', err);
      this.queue = [...INITIAL_DEMO_QUEUE];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.error('[OfflineReportQueue] Failed to save queue to localStorage:', err);
    }
  }

  public getQueue(): QueuedFieldReport[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.filter((i) => i.syncStatus === 'QUEUED' || i.syncStatus === 'SYNCING').length;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback();
      } catch (err) {
        console.error('Error in OfflineReportQueue listener:', err);
      }
    });
  }

  /**
   * Enqueues a report when device is offline or network fails
   */
  public enqueueReport(input: FieldReportInput): QueuedFieldReport {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `OFFLINE-REP-2026-${randomSuffix}`;
    const nowIst = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    const newReport: QueuedFieldReport = {
      id,
      createdAt: `Just now (${nowIst})`,
      incidentType: input.incidentType,
      description: input.description,
      severity: input.severity,
      latitude: input.latitude,
      longitude: input.longitude,
      district: input.district,
      state: input.state as NERState,
      village: input.village,
      roadBlocked: !!input.roadBlocked,
      structuresAtRisk: input.structuresAtRisk,
      photoUrl: input.photoUrl,
      reporterType: input.reporterType,
      reporterName: input.reporterName,
      contactPhone: input.contactPhone,
      syncStatus: 'QUEUED',
      attempts: 0,
    };

    this.queue = [newReport, ...this.queue];
    this.saveToStorage();
    this.notifyListeners();

    // If online, immediately attempt background sync
    if (networkStatusManager.isOnline()) {
      setTimeout(() => this.syncAll(), 1500);
    }

    return newReport;
  }

  /**
   * Synchronizes all queued / failed reports to backend server and reporting service
   */
  public async syncAll(): Promise<{ successCount: number; failCount: number }> {
    if (this.isAutoSyncing) {
      return { successCount: 0, failCount: 0 };
    }

    if (networkStatusManager.isOffline()) {
      console.warn('[OfflineReportQueue] Cannot sync while in offline mode.');
      return { successCount: 0, failCount: 0 };
    }

    this.isAutoSyncing = true;
    networkStatusManager.setSyncing(true);

    let successCount = 0;
    let failCount = 0;

    // Mark queued items as SYNCING
    this.queue = this.queue.map((item) => {
      if (item.syncStatus === 'QUEUED' || item.syncStatus === 'FAILED') {
        return { ...item, syncStatus: 'SYNCING' as QueueItemStatus, attempts: item.attempts + 1 };
      }
      return item;
    });
    this.saveToStorage();
    this.notifyListeners();

    // Process each queued item
    for (const item of this.queue) {
      if (item.syncStatus === 'SYNCING') {
        try {
          // Simulate network transit latency (400ms - 800ms)
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Dispatch to centralized ReportingService
          await reportingService.submitReport({
            incidentType: item.incidentType,
            description: item.description,
            severity: item.severity,
            latitude: item.latitude,
            longitude: item.longitude,
            district: item.district,
            state: item.state,
            village: item.village,
            roadBlocked: item.roadBlocked,
            structuresAtRisk: item.structuresAtRisk,
            photoUrl: item.photoUrl,
            reporterType: item.reporterType,
            reporterName: item.reporterName || 'Community Reporter',
            contactPhone: item.contactPhone,
          });

          const syncedAt = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
          item.syncStatus = 'SYNCED';
          item.syncedAt = syncedAt;
          item.serverIncidentId = `REP-2026-${item.state.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
          item.lastError = undefined;
          successCount++;
        } catch (err: any) {
          item.syncStatus = 'FAILED';
          item.lastError = err?.message || 'Network handshake failed';
          failCount++;
        }
      }
    }

    this.saveToStorage();
    this.isAutoSyncing = false;
    networkStatusManager.setSyncing(false);
    this.notifyListeners();

    return { successCount, failCount };
  }

  /**
   * Retries an individual failed item
   */
  public async retryItem(id: string): Promise<boolean> {
    this.queue = this.queue.map((item) => {
      if (item.id === id) {
        return { ...item, syncStatus: 'QUEUED' as QueueItemStatus };
      }
      return item;
    });
    this.saveToStorage();
    this.notifyListeners();

    if (networkStatusManager.isOnline()) {
      await this.syncAll();
      return true;
    }
    return false;
  }

  /**
   * Deletes an item from the offline queue
   */
  public deleteItem(id: string): void {
    this.queue = this.queue.filter((i) => i.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Clears all synced records
   */
  public clearSynced(): void {
    this.queue = this.queue.filter((i) => i.syncStatus !== 'SYNCED');
    this.saveToStorage();
    this.notifyListeners();
  }

  public getMetrics(): OfflineSyncMetrics {
    return {
      totalInQueue: this.queue.length,
      queuedCount: this.queue.filter((i) => i.syncStatus === 'QUEUED').length,
      syncingCount: this.queue.filter((i) => i.syncStatus === 'SYNCING').length,
      syncedCount: this.queue.filter((i) => i.syncStatus === 'SYNCED').length,
      failedCount: this.queue.filter((i) => i.syncStatus === 'FAILED').length,
      networkState: networkStatusManager.getNetworkState(),
      isSimulatedOffline: networkStatusManager.getIsSimulatedOffline(),
    };
  }
}

export const offlineReportQueue = new OfflineReportQueue();
