'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useOfflineSync, QueuedFieldReport, QueueItemStatus } from '@/services/offline';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Send, 
  Plus, 
  Eye, 
  Smartphone, 
  HardDrive, 
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function OfflineQueuePage() {
  const {
    queue,
    metrics,
    networkState,
    isOffline,
    isOnline,
    isSyncing,
    isSimulatedOffline,
    enqueueReport,
    syncAll,
    retryItem,
    deleteItem,
    clearSynced,
    toggleSimulatedOffline,
  } = useOfflineSync();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inspectItem, setInspectItem] = useState<QueuedFieldReport | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const filteredQueue = queue.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.syncStatus === statusFilter;
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.incidentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getSyncStatusBadge = (status: QueueItemStatus) => {
    switch (status) {
      case 'QUEUED':
        return 'bg-amber-950 text-amber-300 border-amber-700 font-bold';
      case 'SYNCING':
        return 'bg-sky-950 text-sky-300 border-sky-700 animate-pulse font-bold';
      case 'SYNCED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700 font-bold';
      case 'FAILED':
        return 'bg-red-950 text-red-300 border-red-700 font-bold';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleManualSyncAll = async () => {
    setIsSyncingAll(true);
    await syncAll();
    setIsSyncingAll(false);
  };

  const handleAddDemoOfflineReport = () => {
    const districts = [
      { district: 'Pakyong', state: 'Sikkim' as const, village: 'Rorathang Bridge Section' },
      { district: 'East Khasi Hills', state: 'Meghalaya' as const, village: 'Laitkroh Gorge SH-5' },
      { district: 'Dima Hasao', state: 'Assam' as const, village: 'Haflong Lower Cutting' },
      { district: 'Noney', state: 'Manipur' as const, village: 'Tupul Station Axis' },
    ];
    const pick = districts[Math.floor(Math.random() * districts.length)];

    enqueueReport({
      incidentType: 'Landslide',
      description: `Field observation of surface slumping and boulder fall along ${pick.village} access roadway.`,
      severity: 'HIGH',
      latitude: 27.234,
      longitude: 88.489,
      district: pick.district,
      state: pick.state,
      village: pick.village,
      roadBlocked: true,
      structuresAtRisk: 2,
      reporterType: 'Field Officer',
      reporterName: 'SDRF Patrol Scout',
      contactPhone: '+91 94340 55120',
    });
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 md:p-5 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 shadow-inner">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                  OFFLINE SYNCHRONIZATION QUEUE
                </h1>
                <span className="bg-sky-950 text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded border border-sky-800">
                  PWA Local Storage Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Low-network resilience buffer for crowdsourced hazard observations and field officer telemetries
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddDemoOfflineReport}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Plus className="h-3.5 w-3.5 text-amber-400" />
              <span>Enqueue Demo Report</span>
            </button>

            <button
              onClick={handleManualSyncAll}
              disabled={isSyncingAll || isOffline || queue.length === 0}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-sky-950 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Synchronizing...' : 'Sync All Queued Now'}</span>
            </button>
          </div>
        </div>

        {/* Network State & Offline Simulation Controller Banner */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border ${
                networkState === 'ONLINE'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : networkState === 'SYNCING'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-red-950 text-red-400 border-red-800'
              }`}
            >
              {networkState === 'ONLINE' ? (
                <Wifi className="h-5 w-5" />
              ) : networkState === 'SYNCING' ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <WifiOff className="h-5 w-5 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">
                  CURRENT CONNECTION: {networkState}
                </span>
                {isSimulatedOffline && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.2 rounded border border-amber-700">
                    SIMULATED OFFLINE MODE ACTIVE
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] font-sans">
                {networkState === 'ONLINE'
                  ? 'Connected to EOC Cloud. Queued submissions automatically upload in real-time.'
                  : 'Offline operating mode. Submissions are safely saved to local device storage.'}
              </p>
            </div>
          </div>

          {/* Interactive Simulation Switch */}
          <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-300 text-[11px]">Simulate Offline Mode:</span>
            <button
              onClick={() => toggleSimulatedOffline(!isSimulatedOffline)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                isSimulatedOffline
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isSimulatedOffline ? 'Offline (Forced)' : 'Normal (Online)'}
            </button>
          </div>
        </div>

        {/* Sync Status KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">QUEUED (PENDING)</span>
              <b className="text-amber-300 text-sm">{metrics.queuedCount} Reports</b>
              <span className="text-[10px] text-slate-400 block">Awaiting Network</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">IN-FLIGHT SYNCING</span>
              <b className="text-sky-300 text-sm">{metrics.syncingCount} In Transit</b>
              <span className="text-[10px] text-slate-400 block">HTTP Stream Active</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">SUCCESSFULLY SYNCED</span>
              <b className="text-emerald-300 text-sm">{metrics.syncedCount} Uploaded</b>
              <span className="text-[10px] text-slate-400 block">Delivered to EOC</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">FAILED ATTEMPTS</span>
              <b className="text-red-400 text-sm">{metrics.failedCount} Failed</b>
              <span className="text-[10px] text-slate-400 block">Retryable Queue</span>
            </div>
          </div>
        </div>

        {/* Offline Queue Data Table */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-eoc-border pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <span>LOCAL DEVICE SUBMISSION QUEUE</span>
                <span className="text-slate-400 font-normal">({filteredQueue.length} Items)</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Reports remain persisted in browser storage and automatically sync when online connection is detected.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="Search report ID, village, district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="QUEUED">QUEUED</option>
                <option value="SYNCING">SYNCING</option>
                <option value="SYNCED">SYNCED</option>
                <option value="FAILED">FAILED</option>
              </select>

              {metrics.syncedCount > 0 && (
                <button
                  onClick={clearSynced}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700"
                >
                  Clear Synced
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] bg-slate-900/60">
                  <th className="p-2.5">Report ID</th>
                  <th className="p-2.5">Created Time</th>
                  <th className="p-2.5">Location & District</th>
                  <th className="p-2.5">Hazard / Severity</th>
                  <th className="p-2.5">Sync Status</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-200">No reports in offline queue</p>
                      <p className="text-xs">All field submissions are fully synchronized with the EOC server.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-2.5 font-bold text-white">
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="h-3 w-3 text-sky-400" />
                          <span>{item.id}</span>
                        </div>
                        {item.serverIncidentId && (
                          <div className="text-[10px] text-emerald-400 font-normal">
                            Server: {item.serverIncidentId}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-300 text-[11px]">{item.createdAt}</td>
                      <td className="p-2.5 font-sans">
                        <div className="font-bold text-white">{item.village}</div>
                        <div className="text-slate-400 text-[11px]">{item.district}, {item.state}</div>
                      </td>
                      <td className="p-2.5 font-sans">
                        <div className="font-semibold text-slate-200">{item.incidentType}</div>
                        <span className={`text-[10px] font-mono font-bold ${item.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getSyncStatusBadge(item.syncStatus)}`}>
                          {item.syncStatus}
                        </span>
                        {item.syncedAt && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Synced {item.syncedAt}
                          </div>
                        )}
                        {item.lastError && (
                          <div className="text-[10px] text-red-400 mt-0.5 truncate max-w-[120px]" title={item.lastError}>
                            {item.lastError}
                          </div>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.syncStatus !== 'SYNCED' && (
                            <button
                              onClick={() => retryItem(item.id)}
                              disabled={isOffline}
                              title="Retry Synchronization"
                              className="p-1.5 bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 rounded disabled:opacity-40"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => setInspectItem(item)}
                            title="Inspect Payload"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            title="Delete Item"
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INSPECT PAYLOAD MODAL */}
        {inspectItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-eoc-card border border-eoc-border rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className={`px-2 py-0.5 rounded text-[10px] border ${getSyncStatusBadge(inspectItem.syncStatus)}`}>
                    {inspectItem.syncStatus}
                  </span>
                  <h3 className="font-bold text-white text-sm">{inspectItem.id} Payload</h3>
                </div>
                <button
                  onClick={() => setInspectItem(null)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px]">DESCRIPTION:</div>
                  <p className="text-slate-200 font-sans">{inspectItem.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black/40 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">COORDINATES</span>
                    <span className="text-sky-300">{inspectItem.latitude.toFixed(4)}°N, {inspectItem.longitude.toFixed(4)}°E</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ROADWAY BLOCKED</span>
                    <span className={inspectItem.roadBlocked ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {inspectItem.roadBlocked ? 'YES (Carriageway Blocked)' : 'NO (Traffic Flowing)'}
                    </span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">REPORTER</span>
                    <span className="text-slate-200">{inspectItem.reporterType} ({inspectItem.reporterName || 'Anonymous'})</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">SYNC ATTEMPTS</span>
                    <span className="text-purple-300">{inspectItem.attempts} Handshakes</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800 font-sans">
                <button
                  onClick={() => setInspectItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
