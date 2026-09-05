'use client';

import React from 'react';
import { NormalizedWeatherData } from '@/services/weather/types';
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
  ReferenceLine,
} from 'recharts';
import { CloudRain, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

interface RainfallAnalyticsChartsProps {
  data: NormalizedWeatherData;
}

export function RainfallAnalyticsCharts({ data }: RainfallAnalyticsChartsProps) {
  const hourlyData = data.rainfall.hourlyHistory.map((item) => ({
    hour: item.hour,
    hourlyMm: item.rainfallMm,
    cumulativeMm: item.cumulative24hMm,
    intensity: item.intensityMmHr,
    temp: item.temperatureC,
  }));

  const forecastData = data.rainfall.dailyForecasts.map((f) => ({
    day: f.dayName,
    rainMm: f.rainfallExpectedMm,
    hazardProb: f.hazardRiskProbability,
    tempMax: f.temperatureMaxC,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. 24-Hour Hyetograph & Cumulative Saturation (8 Cols) */}
      <div className="lg:col-span-8 bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-eoc-border pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-sky-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                24-HOUR HYETOGRAPH & INTENSITY-DURATION PROGRESSION
              </h3>
              <p className="text-[10px] text-slate-400">
                {data.district} ({data.state}) — Hourly precipitation pulses vs cumulative saturation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded">
              Danger Ref: 130mm
            </span>
            <span className="bg-orange-950/80 text-orange-300 border border-orange-800 px-2 py-0.5 rounded">
              Warning Ref: 70mm
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cumulGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} label={{ value: 'mm', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10 }} label={{ value: 'mm/hr', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }} />
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
              
              {/* Threshold Reference Lines */}
              <ReferenceLine yAxisId="left" y={130} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Danger (130mm)', fill: '#ef4444', fontSize: 9 }} />
              <ReferenceLine yAxisId="left" y={70} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Warning (70mm)', fill: '#f97316', fontSize: 9 }} />
              <ReferenceLine yAxisId="left" y={35} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Watch (35mm)', fill: '#f59e0b', fontSize: 9 }} />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="cumulativeMm"
                name="Cumulative Rain (mm)"
                stroke="#0284c7"
                strokeWidth={2.5}
                fill="url(#cumulGrad)"
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="hourlyMm"
                name="Hourly Rainfall Pulse (mm)"
                stroke="#38bdf8"
                strokeWidth={1.5}
                fill="url(#pulseGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="intensity"
                name="Rainfall Intensity (mm/hr)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 5-Day Rainfall & Landslide Hazard Forecast (4 Cols) */}
      <div className="lg:col-span-4 bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="border-b border-eoc-border pb-2.5 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                5-DAY PRECIPITATION & HAZARD OUTLOOK
              </h3>
              <p className="text-[10px] text-slate-400">IMD WRF ensemble model forecast</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#ef4444" domain={[0, 100]} tick={{ fontSize: 10 }} />
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
              <Bar yAxisId="left" dataKey="rainMm" name="Expected Rain (mm)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="hazardProb" name="Hazard Prob (%)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
