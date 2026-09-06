/**
 * Central Exports and Hook for Offline & Network Sync Engine
 */

'use client';

import { useState, useEffect } from 'react';
import { offlineReportQueue } from './OfflineReportQueue';
import { networkStatusManager } from './NetworkStatusManager';
import {
  QueuedFieldReport,
  QueueItemStatus,
  NetworkConnectionState,
  OfflineSyncMetrics,
} from './types';
import { FieldReportInput } from '@/services/reporting/types';

export * from './types';
export { offlineReportQueue } from './OfflineReportQueue';
export { networkStatusManager } from './NetworkStatusManager';

export function useOfflineSync() {
  const [queue, setQueue] = useState<QueuedFieldReport[]>(() => offlineReportQueue.getQueue());
  const [metrics, setMetrics] = useState<OfflineSyncMetrics>(() => offlineReportQueue.getMetrics());
  const [networkState, setNetworkState] = useState<NetworkConnectionState>(() =>
    networkStatusManager.getNetworkState()
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() =>
    networkStatusManager.getIsSimulatedOffline()
  );

  useEffect(() => {
    const updateQueue = () => {
      setQueue(offlineReportQueue.getQueue());
      setMetrics(offlineReportQueue.getMetrics());
    };

    const updateNetwork = (state: NetworkConnectionState) => {
      setNetworkState(state);
      setIsSimulatedOffline(networkStatusManager.getIsSimulatedOffline());
      setMetrics(offlineReportQueue.getMetrics());
    };

    const unsubQueue = offlineReportQueue.subscribe(updateQueue);
    const unsubNetwork = networkStatusManager.subscribe(updateNetwork);

    return () => {
      unsubQueue();
      unsubNetwork();
    };
  }, []);

  const enqueueReport = (input: FieldReportInput) => {
    return offlineReportQueue.enqueueReport(input);
  };

  const syncAll = async () => {
    return await offlineReportQueue.syncAll();
  };

  const retryItem = async (id: string) => {
    return await offlineReportQueue.retryItem(id);
  };

  const deleteItem = (id: string) => {
    offlineReportQueue.deleteItem(id);
  };

  const clearSynced = () => {
    offlineReportQueue.clearSynced();
  };

  const toggleSimulatedOffline = (simulated: boolean) => {
    networkStatusManager.setSimulatedOffline(simulated);
  };

  return {
    queue,
    metrics,
    networkState,
    isOffline: networkState === 'OFFLINE',
    isOnline: networkState === 'ONLINE',
    isSyncing: networkState === 'SYNCING',
    isSimulatedOffline,
    enqueueReport,
    syncAll,
    retryItem,
    deleteItem,
    clearSynced,
    toggleSimulatedOffline,
  };
}
