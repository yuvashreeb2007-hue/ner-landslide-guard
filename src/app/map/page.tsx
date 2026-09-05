'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { LandslideMap } from '@/components/map/LandslideMap';
import { RiskZoneDrawer } from '@/components/dashboard/RiskZoneDrawer';
import { useEOC } from '@/context/EOCContext';
import { NER_STATES } from '@/data/mockData';
import { Map as MapIcon, ShieldAlert } from 'lucide-react';
import { SeverityBadge } from '@/components/common/SeverityBadge';

export default function LiveMapPage() {
  const {
    riskZones,
    selectedZone,
    setSelectedZone,
    selectedState,
    setSelectedState,
    riskFilter,
    setRiskFilter,
  } = useEOC();

  const filteredZones = riskZones.filter((z) => {
    const matchState = selectedState === 'All NER' || z.state === selectedState;
    const matchRisk = riskFilter === 'ALL' || z.riskLevel === riskFilter;
    return matchState && matchRisk;
  });

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Top Control Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <MapIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                LIVE GIS GEOTECHNICAL RISK OPERATIONS MAP
              </h1>
              <p className="text-xs text-slate-400">
                Interactive spatial hazard telemetry, slope slip vectors & lifeline disruption monitoring
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* State filter */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400 mr-1.5 font-mono">STATE:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {NER_STATES.map((st) => (
                  <option key={st} value={st} className="bg-slate-900 text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk filter */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5">
              <span className="text-[11px] text-slate-400 mr-1.5 font-mono">RISK:</span>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value as any)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-slate-900">All Risk Levels</option>
                <option value="CRITICAL" className="bg-slate-900">Critical (81–100)</option>
                <option value="HIGH" className="bg-slate-900">High (61–80)</option>
                <option value="MODERATE" className="bg-slate-900">Moderate (31–60)</option>
                <option value="LOW" className="bg-slate-900">Low (0–30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Full Height Map & Slide-out Info */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
          <div className="xl:col-span-8 space-y-3">
            {/* Expanded Leaflet Map */}
            <LandslideMap heightClass="h-[640px]" showControls={true} />

            {/* Quick Zone Grid List */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider mb-3 flex items-center justify-between">
                <span>Active Geohazard Zones in View ({filteredZones.length})</span>
                <span className="text-[10px] text-sky-400">Click any zone to focus</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredZones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone)}
                    className={`text-left p-2.5 rounded-lg border transition-all ${
                      selectedZone?.id === zone.id
                        ? 'bg-sky-950/80 border-sky-600 shadow-md'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <SeverityBadge level={zone.riskLevel} size="sm" />
                      <span className="text-[10px] font-mono font-bold text-sky-300">
                        {zone.riskScore}/100
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {zone.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                      <span>{zone.district}, {zone.state}</span>
                      <span className="font-mono">FoS: {zone.factorOfSafety}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Inspector Panel */}
          <div className="xl:col-span-4">
            <RiskZoneDrawer />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
