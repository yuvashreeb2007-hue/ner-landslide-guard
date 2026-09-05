'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Info } from 'lucide-react';

export function MapLegend() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-eoc-card/95 backdrop-blur-md border border-eoc-border rounded-xl shadow-2xl p-3 text-[11px] font-mono select-none max-w-xs transition-all">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between gap-3 cursor-pointer pb-1.5 border-b border-eoc-border"
      >
        <div className="flex items-center gap-1.5 font-bold text-slate-100 uppercase tracking-wider text-[10px]">
          <Info className="h-3.5 w-3.5 text-sky-400" />
          <span>GIS HAZARD LEGEND</span>
        </div>
        <button className="text-slate-400 hover:text-white p-0.5 rounded">
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3 pt-2">
          {/* Risk Score Tiers */}
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">
              Landslide Hazard Score (0–100)
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600 shadow-sm shadow-red-500 animate-pulse shrink-0" />
                <span className="text-red-300 font-bold">CRITICAL (81–100)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
                <span className="text-orange-300 font-bold">HIGH (61–80)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-amber-300 font-bold">MODERATE (31–60)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-emerald-300 font-bold">LOW (0–30)</span>
              </div>
            </div>
          </div>

          {/* Incident Symbology */}
          <div>
            <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1.5">
              Incident Types
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-red-400 text-xs">⛰️</span>
                <span>Landslide</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-orange-400 text-xs">🚧</span>
                <span>Road Blockage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-xs">⚡</span>
                <span>Slope Crack</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sky-400 text-xs">🌊</span>
                <span>Flash Flood</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 text-xs">📉</span>
                <span>Slope Creep</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-400 text-xs">📋</span>
                <span>Field Report</span>
              </div>
            </div>
          </div>

          {/* Other Symbology */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
            <span>■ IoT Sensor (Cyan)</span>
            <span>🏘️ Village (Settlement)</span>
          </div>
        </div>
      )}
    </div>
  );
}
