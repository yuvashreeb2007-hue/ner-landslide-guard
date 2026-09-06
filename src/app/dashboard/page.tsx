'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { KPISection } from '@/components/dashboard/KPISection';
import { LandslideMap } from '@/components/map/LandslideMap';
import { RiskZoneDrawer } from '@/components/dashboard/RiskZoneDrawer';
import { IncidentsTable } from '@/components/dashboard/IncidentsTable';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { EmergencyPrioritySection } from '@/components/dashboard/EmergencyPrioritySection';
import { useEOC } from '@/context/EOCContext';
import { useI18n } from '@/context/I18nContext';
import { 
  Radio, 
  MapPin, 
  Send,
  Layers,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  FileSpreadsheet,
  Settings as SettingsIcon,
  LifeBuoy
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { alerts, eocStats } = useEOC();
  const { t } = useI18n();

  return (
    <MainLayout>
      <ProtectedRoute 
        requiredRoles={['ADMIN']} 
        moduleName="State Emergency Operations Center (EOC) Command Dashboard"
      >
        <div className="space-y-5">
          {/* Top Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-eoc-surface to-purple-950/40 p-4 rounded-xl border border-purple-900/40 shadow-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                <h1 className="text-lg md:text-xl font-black text-white tracking-wide font-mono flex items-center gap-2">
                  <span>STATE EMERGENCY OPERATIONS CENTER</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-300 border border-purple-700 font-bold">
                    ADMIN COMMAND
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-300">
                Full-spectrum disaster surveillance, AI hazard models, heavy rescue dispatch & state node administration
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href="/emergency"
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-950 transition-all"
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                <span>Tactical Dispatch</span>
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <SettingsIcon className="h-3.5 w-3.5 text-sky-400" />
                <span>EOC Administration</span>
              </Link>
            </div>
          </div>

          {/* 1. Top KPI Summary Cards */}
          <KPISection />

          {/* 2. Main Grid: GIS Map & Risk Zone Detailed Inspector */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* Main GIS Map Workspace (8 Cols) */}
            <div className="xl:col-span-8 space-y-4">
              <div className="bg-eoc-card border border-eoc-border rounded-xl p-3.5 shadow-2xl">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sky-400" />
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      {t('dashboard.mapSectionTitle')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>{t('dashboard.nerStatesCount')}</span>
                    <span>•</span>
                    <span className="text-emerald-400">
                      {t('dashboard.sensorsOnlineBadge', { count: eocStats.sensorsOnline })}
                    </span>
                  </div>
                </div>

                {/* GIS Map */}
                <LandslideMap heightClass="h-[460px] md:h-[500px]" />
              </div>

              {/* Emergency Priority Response Matrix */}
              <EmergencyPrioritySection />
            </div>

            {/* Right Sidebar: Risk Zone Detail Inspector & Active Bulletins (4 Cols) */}
            <div className="xl:col-span-4 space-y-4">
              <RiskZoneDrawer />

              {/* Quick Module Navigation Grid for Admin */}
              <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      Executive Command Modules
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    12 Modules
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <Link href="/predictions" className="p-2.5 bg-slate-900/80 hover:bg-purple-950/40 rounded-lg border border-slate-800 hover:border-purple-700/60 transition-all flex flex-col gap-1">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <span className="font-bold text-white">AI Predictions</span>
                    <span className="text-[10px] text-slate-400 font-sans">98% AUC Random Forest</span>
                  </Link>
                  <Link href="/reports" className="p-2.5 bg-slate-900/80 hover:bg-amber-950/40 rounded-lg border border-slate-800 hover:border-amber-700/60 transition-all flex flex-col gap-1">
                    <FileSpreadsheet className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-white">Incident Queue</span>
                    <span className="text-[10px] text-slate-400 font-sans">Moderation & AI Scan</span>
                  </Link>
                  <Link href="/emergency" className="p-2.5 bg-slate-900/80 hover:bg-red-950/40 rounded-lg border border-slate-800 hover:border-red-700/60 transition-all flex flex-col gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="font-bold text-white">Tactical Dispatch</span>
                    <span className="text-[10px] text-slate-400 font-sans">Mountain Battalions</span>
                  </Link>
                  <Link href="/admin" className="p-2.5 bg-slate-900/80 hover:bg-sky-950/40 rounded-lg border border-slate-800 hover:border-sky-700/60 transition-all flex flex-col gap-1">
                    <SettingsIcon className="h-4 w-4 text-sky-400" />
                    <span className="font-bold text-white">System Admin</span>
                    <span className="text-[10px] text-slate-400 font-sans">Rules & User Access</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Incidents Feed Table */}
          <IncidentsTable />

          {/* 4. Telemetry Analytics Section */}
          <ChartsSection />
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
