'use client';

import React from 'react';
import Link from 'next/link';
import { useOfflineSync } from '@/services/offline';
import { Wifi, WifiOff, RefreshCw, Layers } from 'lucide-react';

export function ConnectionIndicator() {
  const { networkState, metrics, isSimulatedOffline } = useOfflineSync();
  const pendingCount = metrics.queuedCount + metrics.syncingCount;

  return (
    <Link
      href="/offline-queue"
      title={
        networkState === 'OFFLINE'
          ? `Operating Offline. ${pendingCount} reports saved locally.`
          : networkState === 'SYNCING'
          ? 'Synchronizing local queue with EOC Cloud...'
          : 'Online: Full telemetry streaming active'
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border transition-all ${
        networkState === 'ONLINE'
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900/80'
          : networkState === 'SYNCING'
          ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 hover:bg-amber-900/80 animate-pulse'
          : 'bg-red-950 text-red-300 border-red-700 hover:bg-red-900 animate-pulse'
      }`}
    >
      {networkState === 'ONLINE' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span>ONLINE</span>
        </>
      )}

      {networkState === 'SYNCING' && (
        <>
          <RefreshCw className="h-3 w-3 text-amber-400 animate-spin" />
          <span>SYNCING ({pendingCount})</span>
        </>
      )}

      {networkState === 'OFFLINE' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <WifiOff className="h-3 w-3 text-red-400" />
          <span>OFFLINE</span>
        </>
      )}

      {pendingCount > 0 && networkState !== 'SYNCING' && (
        <span className="bg-red-900 text-white text-[9px] px-1.5 py-0.2 rounded-full font-sans font-black">
          {pendingCount}
        </span>
      )}

      {isSimulatedOffline && (
        <span className="text-[9px] text-amber-300 bg-amber-950 px-1 rounded border border-amber-800">
          SIM
        </span>
      )}
    </Link>
  );
}
