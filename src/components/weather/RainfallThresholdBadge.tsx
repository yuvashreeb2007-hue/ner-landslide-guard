'use client';

import React from 'react';
import { RainfallThresholdLevel } from '@/services/weather/types';
import { useI18n } from '@/context/I18nContext';
import { 
  ShieldCheck, 
  Eye, 
  AlertTriangle, 
  Flame, 
  CloudRain 
} from 'lucide-react';

interface RainfallThresholdBadgeProps {
  level: RainfallThresholdLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  pulse?: boolean;
}

export function RainfallThresholdBadge({
  level,
  size = 'md',
  showIcon = true,
  pulse = false,
}: RainfallThresholdBadgeProps) {
  const { t } = useI18n();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-mono',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-mono font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-mono font-black',
  };

  const getBadgeConfig = (lvl: RainfallThresholdLevel) => {
    switch (lvl) {
      case 'Normal':
        return {
          bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
          icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />,
          label: t('risk.levels.NORMAL'),
          tag: '<35mm / 24h',
        };
      case 'Watch':
        return {
          bg: 'bg-amber-950/80 border-amber-700 text-amber-300',
          icon: <Eye className="h-3.5 w-3.5 text-amber-400" />,
          label: t('risk.levels.WATCH'),
          tag: '35-70mm / 24h',
        };
      case 'Warning':
        return {
          bg: 'bg-orange-950/80 border-orange-600 text-orange-300',
          icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />,
          label: t('risk.levels.WARNING'),
          tag: '70-130mm / 24h',
        };
      case 'Danger':
        return {
          bg: 'bg-red-950 border-red-600 text-red-300 shadow-md shadow-red-950/50',
          icon: <Flame className="h-3.5 w-3.5 text-red-400" />,
          label: t('risk.levels.DANGER'),
          tag: '>130mm / 24h',
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          icon: <CloudRain className="h-3.5 w-3.5" />,
          label: lvl,
          tag: '',
        };
    }
  };

  const config = getBadgeConfig(level);

  return (
    <span
      className={`inline-flex items-center rounded-lg border uppercase tracking-wider ${
        config.bg
      } ${sizeClasses[size]} ${pulse || level === 'Danger' ? 'animate-pulse' : ''}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      {size !== 'sm' && config.tag && (
        <span className="opacity-75 text-[10px] lowercase font-sans">({config.tag})</span>
      )}
    </span>
  );
}
