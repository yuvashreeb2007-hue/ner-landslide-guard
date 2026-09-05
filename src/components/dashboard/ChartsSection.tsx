'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  MOCK_RAINFALL_SOIL_TRENDS,
  MOCK_HISTORICAL_INCIDENTS_BY_MONTH,
  MOCK_STATE_RISK_SUMMARY,
} from '@/data/mockData';
import { CloudRain, Activity, BarChart2, ShieldAlert } from 'lucide-react';

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Rainfall Trend vs Soil Moisture Saturation Curve */}
      <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-sky-400" />
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">
                24H PRECIPITATION VS. SOIL MOISTURE SATURATION
              </h3>
              <p className="text-[10px] text-slate-400">
                Pore-water pressure correlation curve across critical slope corridors
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
            Live Telemetry
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_RAINFALL_SOIL_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} domain={[0, 240]} />
              <YAxis yAxisId="right" orientation="right" stroke="#f97316" tick={{ fontSize: 10 }} domain={[40, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e1726',
                  borderColor: '#1e2f4a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="rainfall"
                name="24h Rainfall (mm)"
                stroke="#38bdf8"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#rainGrad)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="soilMoisture"
                name="Soil Saturation (%)"
                stroke="#f97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#soilGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="riskIndex"
                name="AI Hazard Risk Index"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#ef4444' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. State-wise Critical Zones & Highway Blockages */}
      <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">
                STATE-WISE HAZARD VULNERABILITY BREAKDOWN
              </h3>
              <p className="text-[10px] text-slate-400">
                Active critical zones & highway disruptions by North Eastern State
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded">
            8 NER States
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_STATE_RISK_SUMMARY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="state" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e1726',
                  borderColor: '#1e2f4a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="criticalZones" name="Critical Risk Zones" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highRisk" name="High Risk Zones" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="roadsBlocked" name="Blocked Lifeline Roads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
