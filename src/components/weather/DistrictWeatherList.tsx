'use client';

import React, { useState } from 'react';
import { DistrictWeatherSummary, RainfallThresholdLevel } from '@/services/weather/types';
import { RainfallThresholdBadge } from './RainfallThresholdBadge';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { 
  CloudRain, 
  Search, 
  Filter, 
  MapPin, 
  ArrowUpRight, 
  TrendingUp, 
  SlidersHorizontal,
  ChevronRight,
  Check
} from 'lucide-react';

interface DistrictWeatherListProps {
  districts: DistrictWeatherSummary[];
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
}

export function DistrictWeatherList({
  districts,
  selectedDistrict,
  onSelectDistrict,
}: DistrictWeatherListProps) {
  const [search, setSearch] = useState('');
  const [filterThreshold, setFilterThreshold] = useState<string>('ALL');

  const filtered = districts.filter((d) => {
    const matchesSearch =
      d.district.toLowerCase().includes(search.toLowerCase()) ||
      d.state.toLowerCase().includes(search.toLowerCase());
    const matchesThreshold =
      filterThreshold === 'ALL' || d.thresholdLevel === filterThreshold;
    return matchesSearch && matchesThreshold;
  });

  return (
    <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-xl overflow-hidden space-y-3 p-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-eoc-border pb-3">
        <div className="flex items-center gap-2">
          <CloudRain className="h-5 w-5 text-sky-400" />
          <div>
            <h3 className="text-xs md:text-sm font-bold text-white uppercase font-mono tracking-wider">
              NORTHEAST INDIA 8-STATE METEOROLOGICAL & RAINFALL MATRIX
            </h3>
            <p className="text-[10px] text-slate-400">
              Live AWS telemetry & rainfall threshold classification by administrative district
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search district or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-sky-500 font-mono w-48 sm:w-56"
            />
          </div>

          {/* Threshold filter pills */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
            {['ALL', 'Danger', 'Warning', 'Watch', 'Normal'].map((th) => (
              <button
                key={th}
                onClick={() => setFilterThreshold(th)}
                className={`px-2 py-1 rounded transition-all ${
                  filterThreshold === th
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {th}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* District Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">District / State</th>
              <th className="p-3">Current Rate</th>
              <th className="p-3">24h Rainfall</th>
              <th className="p-3">7-Day Cumulative</th>
              <th className="p-3">24h / 72h Forecast</th>
              <th className="p-3">Rainfall Threshold</th>
              <th className="p-3">Landslide Risk Impact</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((d) => {
              const isSelected = d.district === selectedDistrict;

              return (
                <tr
                  key={d.district}
                  onClick={() => onSelectDistrict(d.district)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-950/70 border-l-4 border-l-sky-400'
                      : d.thresholdLevel === 'Danger'
                      ? 'bg-red-950/20 hover:bg-red-950/40'
                      : d.thresholdLevel === 'Warning'
                      ? 'bg-orange-950/15 hover:bg-orange-950/30'
                      : 'hover:bg-slate-900/50'
                  }`}
                >
                  {/* District & State */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <MapPin className={`h-3.5 w-3.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-bold text-white font-sans text-xs flex items-center gap-1.5">
                          {d.district}
                          {isSelected && (
                            <span className="text-[9px] bg-sky-900 text-sky-300 px-1.5 py-0.2 rounded font-mono">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">{d.state}</div>
                      </div>
                    </div>
                  </td>

                  {/* Current Rainfall Rate */}
                  <td className="p-3">
                    <span className="font-bold text-sky-400">{d.currentRainfallMm.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-500 ml-1">mm/hr</span>
                  </td>

                  {/* 24h Rainfall */}
                  <td className="p-3">
                    <span
                      className={`font-black ${
                        d.rainfall24hMm >= 130
                          ? 'text-red-400'
                          : d.rainfall24hMm >= 70
                          ? 'text-orange-400'
                          : d.rainfall24hMm >= 35
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {d.rainfall24hMm.toFixed(1)} mm
                    </span>
                  </td>

                  {/* 7-Day Cumulative */}
                  <td className="p-3 text-slate-300">
                    {d.rainfall7dMm.toFixed(1)} mm
                  </td>

                  {/* Forecast */}
                  <td className="p-3 text-slate-300">
                    <span className="text-purple-300 font-bold">{d.forecast24hMm.toFixed(0)}mm</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-slate-400">{d.forecast72hMm.toFixed(0)}mm</span>
                  </td>

                  {/* Threshold Badge */}
                  <td className="p-3">
                    <RainfallThresholdBadge
                      level={d.thresholdLevel}
                      size="sm"
                      pulse={d.thresholdLevel === 'Danger'}
                    />
                  </td>

                  {/* Risk Impact Score */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{d.riskImpactScore}%</span>
                      <SeverityBadge level={d.riskLevel} size="sm" />
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDistrict(d.district);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-sky-900 text-sky-300 rounded text-[10px] font-sans font-semibold inline-flex items-center gap-1 transition-all"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
