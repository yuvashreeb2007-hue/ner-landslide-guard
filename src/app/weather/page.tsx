'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  weatherService, 
  NormalizedWeatherData, 
  DistrictWeatherSummary 
} from '@/services/weather';
import { WeatherOverviewCards } from '@/components/weather/WeatherOverviewCards';
import { RainfallAnalyticsCharts } from '@/components/weather/RainfallAnalyticsCharts';
import { DistrictWeatherList } from '@/components/weather/DistrictWeatherList';
import { RainfallThresholdBadge } from '@/components/weather/RainfallThresholdBadge';
import { 
  CloudRain, 
  CloudLightning, 
  Droplets, 
  Wind, 
  Waves, 
  Sparkles, 
  Radio, 
  RefreshCw,
  ShieldAlert,
  Info,
  Layers,
  MapPin
} from 'lucide-react';

const RIVER_GAUGES = [
  { river: 'Teesta River (Singtam / Rangpo Axis)', state: 'Sikkim', currentLevelM: 352.4, dangerLevelM: 350.0, trend: 'Surging (+0.6m/hr)', status: 'Above Danger Mark' },
  { river: 'Brahmaputra (Guwahati DC Court)', state: 'Assam', currentLevelM: 49.8, dangerLevelM: 49.68, trend: 'Rising (+0.2m/hr)', status: 'Above Danger Mark' },
  { river: 'Barak River (Annapurna Ghat, Silchar)', state: 'Assam', currentLevelM: 19.4, dangerLevelM: 19.83, trend: 'Steady', status: 'Near Warning' },
  { river: 'Ijei River (Tupul Railway Corridor)', state: 'Manipur', currentLevelM: 14.2, dangerLevelM: 13.5, trend: 'Rapid Surge (+1.1m/hr)', status: 'High Flash Flood Threat' },
  { river: 'Dikrong River (Nirjuli, Papum Pare)', state: 'Arunachal Pradesh', currentLevelM: 8.8, dangerLevelM: 9.5, trend: 'Rising', status: 'Moderate' },
];

export default function WeatherPage() {
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('Pakyong');
  const [districtData, setDistrictData] = useState<NormalizedWeatherData | null>(null);
  const [allSummaries, setAllSummaries] = useState<DistrictWeatherSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeSimulationNote, setActiveSimulationNote] = useState<string | null>(null);

  // Load initial meteorological datasets
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [selected, summaries] = await Promise.all([
          weatherService.getDistrictWeatherData(selectedDistrictName),
          weatherService.getAllDistrictsSummary(),
        ]);
        setDistrictData(selected);
        setAllSummaries(summaries);
      } catch (err) {
        console.error('Failed to load weather data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedDistrictName]);

  // Handle Cloudburst Simulation
  const handleSimulateCloudburst = (targetDistrict: string = 'East Khasi Hills') => {
    setIsSimulating(true);
    setSelectedDistrictName(targetDistrict);
    setActiveSimulationNote(`SIMULATING CLOUDBURST IN ${targetDistrict.toUpperCase()}: 28.5 mm/hr intensity pulse injected.`);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Operations Header */}
        <div className="bg-eoc-card p-4 md:p-5 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-800/80 shadow-inner">
              <CloudRain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                  WEATHER & RAINFALL INTELLIGENCE OPERATIONS
                </h1>
                <span className="bg-sky-900/40 text-sky-300 text-[10px] font-mono px-2 py-0.5 rounded border border-sky-700/50">
                  IMD-AWS Network
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Provider-independent rainfall intensity evaluation, 4-tier hazard thresholding & pore-saturation telemetry
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimulateCloudburst('East Khasi Hills')}
              disabled={isSimulating}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-2 shadow-md shadow-amber-950 transition-all active:scale-95 disabled:opacity-50"
            >
              <CloudLightning className={`h-4 w-4 ${isSimulating ? 'animate-bounce' : ''}`} />
              <span>{isSimulating ? 'Injecting Deluge...' : 'Simulate Cherrapunji Cloudburst'}</span>
            </button>
          </div>
        </div>

        {/* Simulation Alert Banner */}
        {activeSimulationNote && (
          <div className="bg-amber-950/70 border border-amber-600 p-3 rounded-xl text-amber-200 text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 font-mono">
              <CloudLightning className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>{activeSimulationNote}</span>
            </div>
            <button
              onClick={() => setActiveSimulationNote(null)}
              className="text-[10px] underline text-amber-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Selected District Overview Cards & Threshold Banner */}
        {districtData ? (
          <WeatherOverviewCards data={districtData} />
        ) : (
          <div className="bg-eoc-card p-8 rounded-xl border border-eoc-border text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
            <span>Loading district meteorological telemetry...</span>
          </div>
        )}

        {/* 2. Hyetograph & Forecast Charts for Selected District */}
        {districtData && <RainfallAnalyticsCharts data={districtData} />}

        {/* 3. 4-Tier Rainfall Threshold System Matrix Guide */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Info className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              GSI-IMD 4-TIER RAINFALL THRESHOLD & LANDSLIDE RISK TRIGGER SYSTEM
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Normal */}
            <div className="bg-eoc-card p-3 rounded-lg border border-emerald-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 font-mono">NORMAL THRESHOLD</span>
                <span className="text-[10px] text-slate-400 font-mono">&lt; 35 mm/24h</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Baseline soil moisture equilibrium. Negligible pore pressure development.
              </p>
              <div className="text-[10px] text-emerald-400 font-mono font-semibold">
                Risk Multiplier: 1.0x (Standard)
              </div>
            </div>

            {/* Watch */}
            <div className="bg-eoc-card p-3 rounded-lg border border-amber-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 font-mono">WATCH (ELEVATED)</span>
                <span className="text-[10px] text-slate-400 font-mono">35 - 70 mm/24h</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pore saturation begins rising. Minor soil creep and tension cracks monitored.
              </p>
              <div className="text-[10px] text-amber-400 font-mono font-semibold">
                Risk Multiplier: 1.20x (+20% Amplification)
              </div>
            </div>

            {/* Warning */}
            <div className="bg-eoc-card p-3 rounded-lg border border-orange-900/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-orange-400 font-mono">WARNING TRIGGERED</span>
                <span className="text-[10px] text-slate-400 font-mono">70 - 130 mm/24h</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Substantial reduction in effective normal stress. High vulnerability along highway cuts.
              </p>
              <div className="text-[10px] text-orange-400 font-mono font-semibold">
                Risk Multiplier: 1.45x (+45% Amplification)
              </div>
            </div>

            {/* Danger */}
            <div className="bg-eoc-card p-3 rounded-lg border border-red-900/60 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-400 font-mono animate-pulse">DANGER / CLOUDBURST</span>
                <span className="text-[10px] text-slate-400 font-mono">&gt; 130 mm/24h</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Critical trigger threshold surpassed. Debris flows and slope shearing imminent.
              </p>
              <div className="text-[10px] text-red-400 font-mono font-bold">
                Risk Multiplier: 1.75x (+75% Amplification)
              </div>
            </div>
          </div>
        </div>

        {/* 4. Multi-District Weather & Rainfall Matrix Table */}
        <DistrictWeatherList
          districts={allSummaries}
          selectedDistrict={selectedDistrictName}
          onSelectDistrict={(dist) => setSelectedDistrictName(dist)}
        />

        {/* 5. Northeast India Critical River Gauges & Hydrographs */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                NORTHEAST INDIA CRITICAL RIVER HYDROLOGY & BASIN GAUGES
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Central Water Commission (CWC) Telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {RIVER_GAUGES.map((rg, idx) => (
              <div key={idx} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rg.river}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    rg.status.includes('Danger') || rg.status.includes('Flash')
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {rg.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Level: <span className="text-cyan-300 font-bold">{rg.currentLevelM}m</span></span>
                  <span className="text-slate-400">Danger Mark: <span className="text-slate-200">{rg.dangerLevelM}m</span></span>
                </div>
                <div className="text-[10px] font-mono text-amber-400 flex items-center justify-between border-t border-slate-800 pt-1.5">
                  <span>Trend: {rg.trend}</span>
                  <span className="text-slate-400">{rg.state}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
