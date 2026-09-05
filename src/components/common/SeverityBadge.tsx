import React from 'react';
import { RiskLevel } from '@/types';

interface SeverityBadgeProps {
  level: RiskLevel | 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  pulse?: boolean;
}

export function SeverityBadge({
  level,
  size = 'md',
  showDot = true,
  pulse = false,
}: SeverityBadgeProps) {
  const norm = level.toUpperCase();

  let bgClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let dotClasses = 'bg-slate-400';
  let pulseClass = '';

  if (norm === 'CRITICAL' || norm === 'RED') {
    bgClasses = 'bg-red-950/80 text-red-400 border-red-800/60 shadow-sm shadow-red-900/40';
    dotClasses = 'bg-red-500';
    if (pulse) pulseClass = 'pulse-critical';
  } else if (norm === 'HIGH' || norm === 'ORANGE') {
    bgClasses = 'bg-orange-950/80 text-orange-400 border-orange-800/60 shadow-sm shadow-orange-900/40';
    dotClasses = 'bg-orange-500';
    if (pulse) pulseClass = 'pulse-orange';
  } else if (norm === 'MODERATE' || norm === 'YELLOW') {
    bgClasses = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
    dotClasses = 'bg-amber-400';
  } else if (norm === 'LOW' || norm === 'GREEN') {
    bgClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
    dotClasses = 'bg-emerald-400';
  } else if (norm === 'SAFE') {
    bgClasses = 'bg-blue-950/80 text-blue-400 border-blue-800/60';
    dotClasses = 'bg-blue-400';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded font-medium tracking-wider',
    md: 'text-xs px-2 py-0.5 rounded-md font-semibold tracking-wide',
    lg: 'text-sm px-3 py-1 rounded-md font-bold tracking-wider',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase ${bgClasses} ${sizeClasses} ${pulseClass}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotClasses} ${
            pulse ? 'animate-ping' : ''
          }`}
        />
      )}
      {norm}
    </span>
  );
}
