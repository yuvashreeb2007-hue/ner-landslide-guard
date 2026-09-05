'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { Road, RoadStatus } from '@/types';
import { 
  GitFork, 
  AlertTriangle, 
  Clock, 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Wrench, 
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import { SeverityBadge } from '@/components/common/SeverityBadge';

export default function RoadsPage() {
  const { roads, eocStats } = useEOC();
  const [selectedRoad, setSelectedRoad] = useState<Road>(roads[0]);

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-950 text-orange-400 border border-orange-800">
              <GitFork className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                CRITICAL HIGHWAY LIFELINES & BRO ROAD CLEARANCE
              </h1>
              <p className="text-xs text-slate-400">
                Border Roads Organisation (BRO) & NHAI heavy equipment deployment and detour routing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-red-950/80 text-red-300 border border-red-800 px-3 py-1 rounded font-bold animate-pulse">
              🚧 {eocStats.roadsBlocked} National Highways Blocked
            </span>
          </div>
        </div>

        {/* Highway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roads.map((road) => {
            const isBlocked = road.status === 'Completely Blocked';
            const isPartial = road.status === 'Partial Lane Open';
            const isSelected = selectedRoad.id === road.id;

            return (
              <div
                key={road.id}
                onClick={() => setSelectedRoad(road)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-950/70 border-sky-500 shadow-xl'
                    : isBlocked
                    ? 'bg-red-950/20 border-red-800/80 hover:border-red-600'
                    : isPartial
                    ? 'bg-amber-950/20 border-amber-800/80 hover:border-amber-600'
                    : 'bg-eoc-card border-eoc-border'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold font-mono text-white">
                      {road.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        isBlocked
                          ? 'bg-red-900 text-red-100 border-red-700 animate-pulse'
                          : isPartial
                          ? 'bg-amber-900 text-amber-100 border-amber-700'
                          : 'bg-emerald-900 text-emerald-100 border-emerald-700'
                      }`}
                    >
                      {road.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-200">
                    {road.route}
                  </h3>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                    <span>{road.district}, {road.state}</span>
                    <span>Length: {road.totalLengthKm} km</span>
                  </div>

                  {road.blockedPointsCount > 0 ? (
                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-red-900/40 text-xs space-y-1">
                      <div className="text-[10px] font-mono text-red-400 font-bold uppercase">
                        {road.blockedPointsCount} Active Chokepoints:
                      </div>
                      {road.criticalChokepoints.map((cp, idx) => (
                        <div key={idx} className="text-slate-300 text-[11px] flex justify-between">
                          <span>• {cp.locationName}</span>
                          <span className="font-mono text-amber-300">{cp.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/40 text-[11px] text-emerald-300">
                      ✅ All highway lanes currently open under normal transit.
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{road.broUnitInCharge}</span>
                  <span>{road.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Road In-Depth Inspection & Clearance Command */}
        <div className="bg-gradient-to-br from-slate-900 via-eoc-card to-slate-950 border border-eoc-border rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  HIGHWAY LOGISTICS & RESTORATION PLAN: {selectedRoad.name} ({selectedRoad.route})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Assigned Command: {selectedRoad.broUnitInCharge}
                </span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
              selectedRoad.status === 'Completely Blocked' ? 'bg-red-900 text-white' : 'bg-amber-900 text-amber-200'
            }`}>
              {selectedRoad.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chokepoint & Machinery Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase font-mono">
                Critical Chokepoints & Heavy Machinery on Site:
              </h4>

              {selectedRoad.criticalChokepoints.map((cp, i) => (
                <div key={i} className="bg-eoc-surface p-3.5 rounded-xl border border-eoc-border space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      {cp.locationName} (Chainage: Km {cp.chainageKm})
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      Risk: {cp.riskScore}/100
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                    <span>Estimated Clearance Time (ETA): <b>{cp.estimatedClearanceEta || '4 Hours'}</b></span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">
                      Heavy Equipment & Dozers Deployed:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cp.heavyMachineryDeployed.map((mach, mIdx) => (
                        <span key={mIdx} className="bg-slate-900 text-slate-200 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                          🚜 {mach}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detour Routes & Traffic Advisory (5 cols) */}
            <div className="lg:col-span-5 bg-eoc-surface p-4 rounded-xl border border-eoc-border space-y-3 text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-2">
                  <Navigation className="h-4 w-4" />
                  <span>EMERGENCY DETOUR ADVISORY</span>
                </div>

                {selectedRoad.detourRouteAvailable ? (
                  <div className="space-y-2">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                      {selectedRoad.detourDescription}
                    </div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Traffic Police Piloted Escort Active</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/40 p-3 rounded-lg border border-red-900/60 text-red-300 text-[11px]">
                    ⚠️ No viable all-weather detour available for freight or heavy emergency vehicles. Complete bottleneck until heavy earthmovers clear the roadway.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>BRO Central Control Room: +91-3592-202911</span>
                <span>ASDMA EOC Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
