'use client';

import React from 'react';
import { useEOC } from '@/context/EOCContext';
import { 
  AlertOctagon, 
  ShieldAlert, 
  GitFork, 
  Radio, 
  FileSpreadsheet, 
  ActivitySquare,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export function KPISection() {
  const { eocStats } = useEOC();

  const cards = [
    {
      id: 'critical-zones',
      title: 'Active Critical Zones',
      value: eocStats.activeCriticalZones,
      unit: 'Zones',
      delta: `+${eocStats.trends.criticalZonesDelta} in 24h`,
      deltaType: 'increase', // bad
      icon: AlertOctagon,
      color: 'text-red-400',
      bgColor: 'bg-red-950/40 border-red-900/60',
      badgeBg: 'bg-red-900/60 text-red-200 border-red-700',
      href: '/map',
      pulse: true,
    },
    {
      id: 'high-risk',
      title: 'High Risk Zones',
      value: eocStats.highRiskZones,
      unit: 'Zones',
      delta: `${eocStats.trends.highRiskZonesDelta} in 24h`,
      deltaType: 'neutral',
      icon: ShieldAlert,
      color: 'text-orange-400',
      bgColor: 'bg-orange-950/40 border-orange-900/60',
      badgeBg: 'bg-orange-900/60 text-orange-200 border-orange-700',
      href: '/predictions',
      pulse: false,
    },
    {
      id: 'roads-blocked',
      title: 'Roads Blocked',
      value: eocStats.roadsBlocked,
      unit: 'Lifelines',
      delta: `+${eocStats.trends.roadsBlockedDelta} New (NH-10, NH-29)`,
      deltaType: 'increase',
      icon: GitFork,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-900/60',
      badgeBg: 'bg-amber-900/60 text-amber-200 border-amber-700',
      href: '/roads',
      pulse: true,
    },
    {
      id: 'active-alerts',
      title: 'Active Alerts',
      value: eocStats.activeAlerts,
      unit: 'CAP Bulletins',
      delta: `+${eocStats.trends.alertsDelta} Broadcasted`,
      deltaType: 'increase',
      icon: Radio,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40 border-sky-900/60',
      badgeBg: 'bg-sky-900/60 text-sky-200 border-sky-700',
      href: '/alerts',
      pulse: false,
    },
    {
      id: 'reports-today',
      title: 'Reports Today',
      value: eocStats.reportsToday,
      unit: 'Submissions',
      delta: `+${eocStats.trends.reportsDelta} Field & Citizen`,
      deltaType: 'increase',
      icon: FileSpreadsheet,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/40 border-purple-900/60',
      badgeBg: 'bg-purple-900/60 text-purple-200 border-purple-700',
      href: '/reports',
      pulse: false,
    },
    {
      id: 'sensors-online',
      title: 'Sensors Online',
      value: `${eocStats.sensorsOnline}/${eocStats.totalSensors}`,
      unit: 'Telemetry',
      delta: `${eocStats.trends.sensorsOnlinePercent}% Network Health`,
      deltaType: 'good',
      icon: ActivitySquare,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-900/60',
      badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
      href: '/sensors',
      pulse: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Link
            key={card.id}
            href={card.href}
            className={`group relative p-3.5 rounded-xl border ${card.bgColor} backdrop-blur-md transition-all hover:translate-y-[-2px] hover:shadow-xl hover:border-slate-500/50 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider line-clamp-1">
                {card.title}
              </span>
              <div
                className={`p-1.5 rounded-lg bg-eoc-card border border-eoc-border ${card.color} ${
                  card.pulse ? 'animate-pulse' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black font-mono tracking-tight text-white">
                  {card.value}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{card.unit}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-mono truncate">
                  {card.delta}
                </span>
                <ArrowUpRight className="h-3 w-3 text-slate-500 group-hover:text-sky-400 transition-colors shrink-0" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
