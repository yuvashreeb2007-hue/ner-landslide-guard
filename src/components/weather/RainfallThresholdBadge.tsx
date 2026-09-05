'use client';

import React from 'react';
import { RainfallThresholdLevel } from '@/services/weather/types';
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
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1 font-mono',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-mono font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-mono font-black',
  };

  const config = {
    Normal: {
      bg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
      icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />,
      label: 'NORMAL THRESHOLD',
      tag: '<35mm / 24h',
    },
    Watch: {
      bg: 'bg-amber-950/80 border-amber-700 text-amber-300',
      icon: <Eye className="h-3.5 w-3.5 text-amber-400" />,
      label: 'WATCH (ELEVATED)',
      tag: '35-70mm / 24h',
    },
    Warning: {
      bg: 'bg-orange-950/80 border-orange-600 text-orange-300',
      icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />,
      label: 'WARNING TRIGGERED',
      tag: '70-130mm / 24h',
    },
    Danger: {
      bg: 'bg-red-950 border-red-600 text-red-300 shadow-md shadow-red-950/50',
      icon: <Flame className="h-3.5 w-3.5 text-red-400" />,
      label: 'DANGER / CLOUDBURST',
      tag: '>130mm / 24h',
    },
  }[level] || {
    bg: 'bg-slate-900 border-slate-700 text-slate-300',
    icon: <CloudRain className="h-3.5 w-3.5" />,
    label: level,
    tag: '',
  };

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
