'use client';

import React from 'react';
import { SensorKPIs } from '@/services/sensor/types';
import { useI18n } from '@/context/I18nContext';
import { 
  ActivitySquare, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  PowerOff, 
  BatteryCharging, 
  Wifi 
} from 'lucide-react';

interface SensorKPICardsProps {
  kpis: SensorKPIs;
}

export function SensorKPICards({ kpis }: SensorKPICardsProps) {
  const { t } = useI18n();

  const cards = [
    {
      title: t('sensors.totalSensors'),
      value: kpis.totalSensors,
      unit: 'Nodes Deployed',
      icon: ActivitySquare,
      color: 'text-sky-400',
      bgColor: 'bg-eoc-card border-eoc-border',
      badgeBg: 'bg-sky-950 text-sky-300 border-sky-800',
      subtext: '8 North Eastern States',
    },
    {
      title: t('sensors.online'),
      value: kpis.online,
      unit: 'Active Telemetry',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30 border-emerald-900/60',
      badgeBg: 'bg-emerald-900/60 text-emerald-200 border-emerald-700',
      subtext: `${kpis.totalSensors > 0 ? Math.round((kpis.online / kpis.totalSensors) * 100) : 0}% Network Uptime`,
    },
    {
      title: t('sensors.warning'),
      value: kpis.warning,
      unit: 'Threshold Surpassed',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/30 border-amber-900/60',
      badgeBg: 'bg-amber-900/60 text-amber-200 border-amber-700',
      subtext: 'Elevated Shear / Moisture',
    },
    {
      title: t('sensors.critical'),
      value: kpis.critical,
      unit: 'Immediate Threat',
      icon: Flame,
      color: 'text-red-400',
      bgColor: 'bg-red-950/40 border-red-900/70',
      badgeBg: 'bg-red-900/80 text-red-200 border-red-600',
      subtext: 'Failure Threshold Breached',
      pulse: kpis.critical > 0,
    },
    {
      title: t('sensors.offline'),
      value: kpis.offline,
      unit: 'Maintenance Required',
      icon: PowerOff,
      color: 'text-slate-400',
      bgColor: 'bg-slate-900/60 border-slate-800',
      badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
      subtext: 'Battery / Signal Loss',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border ${card.bgColor} shadow-lg flex flex-col justify-between transition-all hover:translate-y-[-1px]`}
          >
            <div className="flex items-center justify-between gap-1 mb-2">
              <span className="text-[10px] font-bold text-slate-300 uppercase font-mono tracking-wider line-clamp-1">
                {card.title}
              </span>
              <div
                className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${card.color} ${
                  card.pulse ? 'animate-pulse' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${card.color}`}>
                  {card.value}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">{card.unit}</span>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono truncate">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
