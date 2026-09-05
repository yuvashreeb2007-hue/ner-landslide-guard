'use client';

import React from 'react';
import { 
  Layers, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  Users, 
  Activity, 
  AlertTriangle, 
  FileSpreadsheet,
  Check
} from 'lucide-react';

export interface LayerToggleState {
  heatmap: boolean;
  riskZones: boolean;
  roads: boolean;
  villages: boolean;
  sensors: boolean;
  incidents: boolean;
  fieldReports: boolean;
}

interface MapLayerSelectorProps {
  layers: LayerToggleState;
  onToggle: (layerKey: keyof LayerToggleState) => void;
  counts: {
    riskZones: number;
    roads: number;
    villages: number;
    sensors: number;
    incidents: number;
    fieldReports: number;
  };
}

export function MapLayerSelector({
  layers,
  onToggle,
  counts,
}: MapLayerSelectorProps) {
  const layerConfigs: {
    key: keyof LayerToggleState;
    label: string;
    icon: any;
    count?: number;
    activeClass: string;
  }[] = [
    {
      key: 'heatmap',
      label: 'Risk Heatmap',
      icon: ShieldAlert,
      activeClass: 'bg-red-950/90 text-red-300 border-red-700 shadow-sm shadow-red-950',
    },
    {
      key: 'riskZones',
      label: 'Risk Zones',
      icon: MapPin,
      count: counts.riskZones,
      activeClass: 'bg-orange-950/90 text-orange-300 border-orange-700 shadow-sm shadow-orange-950',
    },
    {
      key: 'roads',
      label: 'Roads & Lifelines',
      icon: Navigation,
      count: counts.roads,
      activeClass: 'bg-amber-950/90 text-amber-300 border-amber-700 shadow-sm shadow-amber-950',
    },
    {
      key: 'villages',
      label: 'Villages',
      icon: Users,
      count: counts.villages,
      activeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-700 shadow-sm shadow-indigo-950',
    },
    {
      key: 'sensors',
      label: 'Sensors',
      icon: Activity,
      count: counts.sensors,
      activeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-700 shadow-sm shadow-cyan-950',
    },
    {
      key: 'incidents',
      label: 'Incidents',
      icon: AlertTriangle,
      count: counts.incidents,
      activeClass: 'bg-rose-950/90 text-rose-300 border-rose-700 shadow-sm shadow-rose-950',
    },
    {
      key: 'fieldReports',
      label: 'Field Reports',
      icon: FileSpreadsheet,
      count: counts.fieldReports,
      activeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-700 shadow-sm shadow-emerald-950',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-eoc-card/90 backdrop-blur-md p-1.5 rounded-xl border border-eoc-border shadow-2xl">
      <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono font-bold text-sky-400 bg-slate-900 rounded-md border border-slate-800 shrink-0">
        <Layers className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">LAYERS:</span>
      </div>

      {layerConfigs.map((cfg) => {
        const Icon = cfg.icon;
        const isActive = layers[cfg.key];

        return (
          <button
            key={cfg.key}
            onClick={() => onToggle(cfg.key)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold border transition-all active:scale-95 ${
              isActive
                ? cfg.activeClass
                : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-900'
            }`}
            title={`Toggle ${cfg.label} Layer`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span>{cfg.label}</span>
            {cfg.count !== undefined && (
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                  isActive ? 'bg-black/40 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cfg.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
