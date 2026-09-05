'use client';

import React from 'react';
import { SensorData } from '@/services/sensor/types';
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
import { Droplets, CloudRain, Activity, BatteryCharging, Wifi } from 'lucide-react';

interface SensorAnalyticsChartsProps {
  sensors: SensorData[];
}

export function SensorAnalyticsCharts({ sensors }: SensorAnalyticsChartsProps) {
  // Extract key sensors for individual telemetry tracks
  const soilSensors = sensors.filter((s) => s.sensorType === 'Soil Moisture');
  const tiltSensors = sensors.filter((s) => s.sensorType === 'Slope Tilt');
  const rainSensors = sensors.filter((s) => s.sensorType === 'Rain Gauge');

  // Build time-series dataset from history
  const historyLen = soilSensors[0]?.history.length || 10;
  const multiTrackTimeline = [];

  for (let i = 0; i < historyLen; i++) {
    const point: any = {
      time: soilSensors[0]?.history[i]?.timestamp || `T-${historyLen - i}`,
    };

    soilSensors.slice(0, 3).forEach((s) => {
      point[s.sensorId] = s.history[i]?.value ?? s.currentValue;
    });

    tiltSensors.slice(0, 2).forEach((s) => {
      point[s.sensorId] = s.history[i]?.value ?? s.currentValue;
    });

    rainSensors.slice(0, 2).forEach((s) => {
      point[s.sensorId] = s.history[i]?.value ?? s.currentValue;
    });

    multiTrackTimeline.push(point);
  }

  // Battery distribution data
  const batteryData = sensors.map((s) => ({
    name: s.sensorId.replace('SEN-', ''),
    battery: s.battery,
    signal: s.signalStrength,
    type: s.sensorType,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 1. Soil Moisture Dynamic Saturation Curve (6 cols) */}
      <div className="lg:col-span-6 bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-eoc-border pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-cyan-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                SOIL MOISTURE SATURATION TELEMETRY (%)
              </h3>
              <p className="text-[10px] text-slate-400">
                Pore-water pressure probes across critical slope horizons
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
            Liquid Limit: 82%
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={multiTrackTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="smGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#06b6d4" domain={[20, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e1726',
                  borderColor: '#1e2f4a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              <ReferenceLine y={82} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical (82%)', fill: '#ef4444', fontSize: 9 }} />
              {soilSensors.slice(0, 3).map((s, idx) => (
                <Area
                  key={s.sensorId}
                  type="monotone"
                  dataKey={s.sensorId}
                  name={`${s.district} (${s.sensorId})`}
                  stroke={idx === 0 ? '#06b6d4' : idx === 1 ? '#38bdf8' : '#818cf8'}
                  fill="url(#smGrad1)"
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Slope Tilt Inclinometer Displacement (6 cols) */}
      <div className="lg:col-span-6 bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-eoc-border pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-rose-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                SLOPE TILT & INCLINOMETER ANGULAR DISPLACEMENT (°)
              </h3>
              <p className="text-[10px] text-slate-400">
                Bi-axial deep borehole shear monitoring vs threshold limit
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-red-950/80 text-red-300 border border-red-800 px-2 py-0.5 rounded">
            Failure Limit: 3.5°
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={multiTrackTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#f43f5e" domain={[0, 7]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e1726',
                  borderColor: '#1e2f4a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              <ReferenceLine y={3.5} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Shear Failure (3.5°)', fill: '#ef4444', fontSize: 9 }} />
              {tiltSensors.slice(0, 3).map((s, idx) => (
                <Line
                  key={s.sensorId}
                  type="monotone"
                  dataKey={s.sensorId}
                  name={`${s.district} Inclinometer (${s.sensorId})`}
                  stroke={idx === 0 ? '#f43f5e' : idx === 1 ? '#fb923c' : '#a855f7'}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Rainfall Intensity Pulses (6 cols) */}
      <div className="lg:col-span-6 bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-eoc-border pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-sky-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                AUTOMATED RAIN GAUGE PRECIPITATION PULSES (MM/HR)
              </h3>
              <p className="text-[10px] text-slate-400">
                In-situ rainfall intensity rate from AWS tipping bucket sensors
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-800 px-2 py-0.5 rounded">
            GSI Intensity Alert: 15 mm/hr
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiTrackTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#38bdf8" domain={[0, 35]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e1726',
                  borderColor: '#1e2f4a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              <ReferenceLine y={15} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Warning (15mm/hr)', fill: '#f59e0b', fontSize: 9 }} />
              {rainSensors.slice(0, 2).map((s, idx) => (
                <Bar
                  key={s.sensorId}
                  dataKey={s.sensorId}
                  name={`${s.district} Rain Gauge (${s.sensorId})`}
                  fill={idx === 0 ? '#38bdf8' : '#60a5fa'}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Fleet Battery & LoRa Signal Strength Health Distribution (6 cols) */}
      <div className="lg:col-span-6 bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-eoc-border pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <BatteryCharging className="h-4 w-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                IOT FLEET BATTERY & LORAWAN LINK QUALITY (%)
              </h3>
              <p className="text-[10px] text-slate-400">
                Power reserves & RF telemetry signal integrity across all nodes
              </p>
            </div>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={batteryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" height={45} />
              <YAxis stroke="#10b981" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e1726',
                  borderColor: '#1e2f4a',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#ffffff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
              <Bar dataKey="battery" name="Battery Reserve (%)" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="signal" name="LoRa Signal (%)" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
