'use client';

import React from 'react';
import { NormalizedWeatherData } from '@/services/weather/types';
import { RainfallThresholdBadge } from './RainfallThresholdBadge';
import { useI18n } from '@/context/I18nContext';
import { 
  CloudRain, 
  Droplets, 
  Thermometer, 
  Wind, 
  Activity, 
  Calendar, 
  TrendingUp, 
  ShieldAlert,
  Clock,
  Gauge
} from 'lucide-react';

interface WeatherOverviewCardsProps {
  data: NormalizedWeatherData;
}

export function WeatherOverviewCards({ data }: WeatherOverviewCardsProps) {
  const { t } = useI18n();
  const isHighRisk = data.threshold.level === 'Danger' || data.threshold.level === 'Warning';

  return (
    <div className="space-y-4">
      {/* Dynamic Threshold Alert Strip */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg ${
          data.threshold.level === 'Danger'
            ? 'bg-red-950/60 border-red-700 text-red-200'
            : data.threshold.level === 'Warning'
            ? 'bg-orange-950/60 border-orange-700 text-orange-200'
            : data.threshold.level === 'Watch'
            ? 'bg-amber-950/50 border-amber-700 text-amber-200'
            : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <RainfallThresholdBadge level={data.threshold.level} size="md" pulse={isHighRisk} />
          <div>
            <span className="font-bold text-xs block text-white">
              {data.district}, {data.state} — {data.threshold.description}
            </span>
            <span className="text-[11px] opacity-90">{data.threshold.actionRequired}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700">
            Pore Saturation: {(data.threshold.saturationIndex * 100).toFixed(0)}%
          </span>
          <span className="bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700 text-sky-300">
            Risk Multiplier: {data.riskImpact.scoreMultiplier}x
          </span>
        </div>
      </div>

      {/* 7 Operational Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* 1. Current Rainfall Rate */}
        <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>{t('weather.currentRainfall')}</span>
            <CloudRain className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-black font-mono text-sky-400">
            {data.rainfall.currentRateMmHr.toFixed(1)} <span className="text-[10px] text-slate-500">mm/hr</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {data.rainfall.currentRateMmHr > 0 ? 'Active Precipitation' : 'No Rain'}
          </div>
        </div>

        {/* 2. 24-Hour Rainfall */}
        <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>{t('weather.rainfall24h')}</span>
            <Clock className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className={`text-xl font-black font-mono ${data.rainfall.rainfall24hMm >= 100 ? 'text-red-400' : 'text-blue-300'}`}>
            {data.rainfall.rainfall24hMm.toFixed(1)} <span className="text-[10px] text-slate-500">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Antecedent Depth
          </div>
        </div>

        {/* 3. 7-Day Cumulative */}
        <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>{t('weather.rainfall7d')}</span>
            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black font-mono text-indigo-300">
            {data.rainfall.rainfall7dMm.toFixed(1)} <span className="text-[10px] text-slate-500">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Ground Storage
          </div>
        </div>

        {/* 4. Rainfall Intensity Category */}
        <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>{t('weather.rainfallIntensity')}</span>
            <Gauge className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-black font-mono text-amber-300 truncate pt-1">
            {data.rainfall.intensityCategory.split(' ')[0]}
          </div>
          <div className="text-[9px] text-slate-400 truncate">
            {data.rainfall.intensityCategory}
          </div>
        </div>

        {/* 5. Forecast 24h & 72h */}
        <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>{t('weather.forecast')}</span>
            <TrendingUp className="h-3.5 w-3.5 text-purple-400" />
          </div>
          <div className="text-lg font-black font-mono text-purple-300">
            {data.rainfall.forecast24hMm.toFixed(0)} <span className="text-xs text-slate-500">/</span> {data.rainfall.forecast72hMm.toFixed(0)} <span className="text-[10px] text-slate-500">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            IMD Projection
          </div>
        </div>

        {/* 6. Temperature */}
        <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>{t('weather.temperature')}</span>
            <Thermometer className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black font-mono text-rose-300">
            {data.currentWeather.temperature.toFixed(1)} <span className="text-[10px] text-slate-500">°C</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Dew: {data.currentWeather.dewPoint}°C
          </div>
        </div>

        {/* 7. Humidity */}
        <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
            <span>{t('weather.humidity')}</span>
            <Droplets className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-black font-mono text-cyan-300">
            {data.currentWeather.humidity}%
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            Wind: {data.currentWeather.windSpeed} km/h {data.currentWeather.windDirection}
          </div>
        </div>
      </div>
    </div>
  );
}
