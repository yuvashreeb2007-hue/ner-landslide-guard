'use client';

import React, { useState } from 'react';
import { SimulationScenario } from '@/services/sensor/types';
import { 
  Zap, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Radio,
  Sliders,
  Cpu,
  Check
} from 'lucide-react';

interface SensorSimulatorControlsProps {
  onSetScenario: (scenario: SimulationScenario) => void;
  onTriggerTick: () => void;
}

export function SensorSimulatorControls({
  onSetScenario,
  onTriggerTick,
}: SensorSimulatorControlsProps) {
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>('WARNING');
  const [isPulsing, setIsPulsing] = useState(false);

  const handleScenarioChange = (sc: SimulationScenario) => {
    setActiveScenario(sc);
    onSetScenario(sc);
  };

  const handleManualPulse = () => {
    setIsPulsing(true);
    onTriggerTick();
    setTimeout(() => setIsPulsing(false), 600);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-eoc-card to-slate-900 border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Left: Title and Engine Status */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/80 shadow-inner">
          <Cpu className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs md:text-sm font-bold text-white uppercase font-mono tracking-wider">
              IoT Sensor Fleet Simulator & Telemetry Injector
            </h3>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time stochastic Brownian micro-fluctuations (every 3.5s) • Pluggable for MQTT / LoRaWAN
          </p>
        </div>
      </div>

      {/* Right: Interactive Scenario Selector & Manual Pulse */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => handleScenarioChange('NORMAL')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeScenario === 'NORMAL'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold shadow-md shadow-emerald-950'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Normal State</span>
          </button>

          <button
            onClick={() => handleScenarioChange('WARNING')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeScenario === 'WARNING'
                ? 'bg-amber-950 text-amber-300 border border-amber-700 font-bold shadow-md shadow-amber-950'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span>Warning State</span>
          </button>

          <button
            onClick={() => handleScenarioChange('CRITICAL')}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              activeScenario === 'CRITICAL'
                ? 'bg-red-950 text-red-300 border border-red-700 font-bold shadow-md shadow-red-950 animate-pulse'
                : 'text-slate-400 hover:text-red-300'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-red-400" />
            <span>Critical Failure</span>
          </button>
        </div>

        <button
          onClick={handleManualPulse}
          className="bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-xs font-bold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isPulsing ? 'animate-spin text-sky-400' : ''}`} />
          <span>Inject Pulse</span>
        </button>
      </div>
    </div>
  );
}
