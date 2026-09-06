'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { useEOC } from '@/context/EOCContext';
import { useFieldReports } from '@/services/reporting';
import { useOfflineSync } from '@/services/offline';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { 
  HardHat, 
  Send, 
  MapPin, 
  Camera, 
  Video, 
  FileSpreadsheet, 
  PhoneCall, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Radio, 
  Compass,
  Sparkles,
  ChevronRight,
  WifiOff,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function FieldDashboardPage() {
  const { user } = useAuth();
  const { riskZones, alerts } = useEOC();
  const { reports } = useFieldReports();
  const { queue, metrics, isOnline, isSyncing, syncAll } = useOfflineSync();
  const pendingCount = (metrics?.queuedCount || 0) + (metrics?.failedCount || 0);

  const incidentTypes = [
    { type: 'Landslide', desc: 'Active debris slide or mudflow', color: 'border-red-700 bg-red-950/40 text-red-300' },
    { type: 'Road Blockage', desc: 'Debris blocking mountain highway', color: 'border-orange-700 bg-orange-950/40 text-orange-300' },
    { type: 'Slope Crack', desc: 'Tension fissures > 5cm on slope crest', color: 'border-amber-700 bg-amber-950/40 text-amber-300' },
    { type: 'Slope Movement', desc: 'Creeping retaining wall / tilted poles', color: 'border-purple-700 bg-purple-950/40 text-purple-300' },
    { type: 'Flood', desc: 'Flash flood or toe water surge', color: 'border-sky-700 bg-sky-950/40 text-sky-300' },
  ];

  return (
    <MainLayout>
      <ProtectedRoute 
        requiredRoles={['ADMIN', 'DISTRICT_OFFICER', 'FIELD_OFFICER']} 
        moduleName="First Responder & SDRF Field Reconnaissance Console"
      >
        <div className="space-y-5">
          {/* Header Banner with Primary Action */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-4 md:p-6 rounded-xl border border-amber-800/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 shadow-inner">
                <HardHat className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-black text-white font-mono tracking-wide">
                    FIELD RECONNAISSANCE & FIRST RESPONDER PORTAL
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                    FIELD OPS
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Officer: <strong className="text-white">{user?.full_name || 'SI Bhaskar Kalita'}</strong> • Unit: <span className="text-amber-300">{user?.department || '1st Bn SDRF Recon'}</span> ({user?.jurisdiction || 'Dima Hasao Corridor'})
                </p>
              </div>
            </div>

            {/* High-Visibility Primary Call To Action */}
            <Link
              href="/field-report"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-sm rounded-xl shadow-xl shadow-amber-950/80 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 border border-amber-300/40"
            >
              <Send className="h-5 w-5 animate-pulse" />
              <span>+ REPORT INCIDENT</span>
            </Link>
          </div>

          {/* Offline Sync Status & Quick Field Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PWA Offline Sync Telemetry Card */}
            <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white">
                  {isOnline ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <WifiOff className="h-4 w-4 text-red-400" />}
                  <span>OFFLINE PWA QUEUE</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isOnline ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-red-950 text-red-300 border border-red-700'
                }`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE MODE'}
                </span>
              </div>

              <div className="text-xs text-slate-300">
                {pendingCount > 0 ? (
                  <span className="text-amber-300 font-bold">{pendingCount} report(s) queued for sync</span>
                ) : (
                  <span className="text-emerald-400 font-bold">All local reports synchronized with State EOC</span>
                )}
              </div>

              <div className="pt-1 flex items-center justify-between">
                <Link href="/offline-queue" className="text-xs text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1">
                  <span>View Queue</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>

                <button
                  onClick={() => syncAll()}
                  disabled={isSyncing || !isOnline}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-mono rounded flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>

            {/* Quick GPS & Device Sensors Card */}
            <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>FIELD GPS SATELLITE LOCK</span>
                <span className="text-emerald-400 font-bold">3D FIX (±4.2m)</span>
              </div>
              <div className="text-sm font-bold text-white">
                25.6748° N, 93.0244° E
              </div>
              <div className="text-[11px] text-slate-400">
                Elevation: 712m • Bearing: 38° NE • Soil Saturation: 84%
              </div>
            </div>

            {/* Field Moderation Summary */}
            <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>SUBMITTED REPORTS LOG</span>
                <Link href="/reports" className="text-sky-400 hover:underline">All ({reports.length})</Link>
              </div>
              <div className="text-sm font-bold text-amber-400">
                {reports.filter(r => r.status === 'NEW').length} Pending Field Verification
              </div>
              <div className="text-[11px] text-slate-400">
                AI Computer Vision scans active on photo uploads
              </div>
            </div>
          </div>

          {/* Incident Submission Type Quick Grid */}
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Select Incident Type to Submit Field Report (GPS + AI Vision)</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">Supports Photo / Video / Offline Storage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {incidentTypes.map((item) => (
                <Link
                  key={item.type}
                  href={`/field-report?type=${encodeURIComponent(item.type)}`}
                  className={`p-3.5 rounded-xl border ${item.color} hover:brightness-125 transition-all flex flex-col justify-between space-y-2 shadow`}
                >
                  <div>
                    <div className="font-bold text-sm text-white font-mono">{item.type}</div>
                    <p className="text-[11px] text-slate-300 mt-1 font-sans">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                    <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> Photo</span>
                    <span className="text-sky-400 font-bold">Report ➔</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Nearby Ground Reports Feed */}
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                <FileSpreadsheet className="h-4 w-4 text-sky-400" />
                <span>Recent Field & Citizen Reports in Your Sector</span>
              </div>
              <Link href="/reports" className="text-[10px] text-sky-400 font-mono">Full Incident Queue</Link>
            </div>

            <div className="space-y-2.5">
              {reports.slice(0, 4).map((report) => (
                <div key={report.id} className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">{report.id}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] bg-slate-800 text-sky-300 font-mono">
                        {report.incidentType}
                      </span>
                      <SeverityBadge level={report.severity} size="sm" />
                    </div>
                    <p className="text-slate-300 text-xs">{report.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Village: {report.village}, {report.district} • Reporter: {report.reporterType} • {new Date(report.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                      report.status === 'VERIFIED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      report.status === 'INVESTIGATING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-sky-950 text-sky-300 border border-sky-800'
                    }`}>
                      {report.status}
                    </span>
                    <Link
                      href={`/reports?id=${report.id}`}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-xs rounded border border-slate-700"
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
