'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { KPISection } from '@/components/dashboard/KPISection';
import { LandslideMap } from '@/components/map/LandslideMap';
import { RiskZoneDrawer } from '@/components/dashboard/RiskZoneDrawer';
import { IncidentsTable } from '@/components/dashboard/IncidentsTable';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { EmergencyPrioritySection } from '@/components/dashboard/EmergencyPrioritySection';
import { useEOC } from '@/context/EOCContext';
import { 
  Radio, 
  AlertTriangle, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  Send,
  CloudLightning,
  Sparkles,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { SeverityBadge } from '@/components/common/SeverityBadge';

export default function DashboardPage() {
  const { alerts, riskZones, selectedZone, setSelectedZone } = useEOC();
  const activeAlerts = alerts.filter((a) => a.status === 'Active');

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-eoc-surface to-slate-900 p-4 rounded-xl border border-eoc-border shadow-lg">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-lg md:text-xl font-black text-white tracking-wide font-mono">
                DISASTER OPERATIONS & EARLY WARNING CENTER
              </h1>
            </div>
            <p className="text-xs text-slate-300">
              Real-time multi-hazard telemetry, AI slope stability modeling & CAP broadcast network for 8 North Eastern States
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/map"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              <span>Expanded GIS Map</span>
            </Link>
            <Link
              href="/field-report"
              className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-950 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit Ground Report</span>
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
                    Interactive Northeast India GIS Hazard Operations Map
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span>8 NER States</span>
                  <span>•</span>
                  <span className="text-emerald-400">142 Online Sensors</span>
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
            {/* Risk Zone Slideover / Detailed Inspector */}
            <RiskZoneDrawer />

            {/* Active Emergency Broadcasts Widget */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-eoc-border pb-2.5">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Active Warning Bulletins ({activeAlerts.length})
                  </h3>
                </div>
                <Link
                  href="/alerts"
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-mono font-semibold"
                >
                  View All CAP Alerts →
                </Link>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {activeAlerts.slice(0, 3).map((alt) => (
                  <div
                    key={alt.id}
                    className="p-3 bg-slate-900/80 rounded-lg border border-red-900/40 hover:border-red-700/60 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <SeverityBadge level={alt.severity} size="sm" pulse={alt.severity === 'RED'} />
                      <span className="text-[10px] font-mono text-slate-400">{alt.issuedTime}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{alt.title}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{alt.reason}</p>
                    <div className="text-[10px] text-sky-400 font-mono pt-1 border-t border-slate-800 flex justify-between">
                      <span>{alt.affectedDistrict}, {alt.state}</span>
                      <span>Delivered: {alt.broadcastDeliveredCount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Real-Time Telemetry Trend Charts */}
        <ChartsSection />

        {/* 4. Live Incidents Feed Table */}
        <IncidentsTable />
      </div>
    </MainLayout>
  );
}
