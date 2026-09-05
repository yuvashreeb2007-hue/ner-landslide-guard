'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { 
  CloudRain, 
  CloudLightning, 
  Droplets, 
  Wind, 
  Gauge, 
  Waves, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const RIVER_GAUGES = [
  { river: 'Teesta River (Singtam / Rangpo)', state: 'Sikkim', currentLevelM: 352.4, dangerLevelM: 350.0, trend: 'Surging (+0.6m/hr)', status: 'Above Danger Mark' },
  { river: 'Brahmaputra (Guwahati DC Court)', state: 'Assam', currentLevelM: 49.8, dangerLevelM: 49.68, trend: 'Rising (+0.2m/hr)', status: 'Above Danger Mark' },
  { river: 'Barak River (Annapurna Ghat, Silchar)', state: 'Assam', currentLevelM: 19.4, dangerLevelM: 19.83, trend: 'Steady', status: 'Near Warning' },
  { river: 'Ijei River (Tupul Valley)', state: 'Manipur', currentLevelM: 14.2, dangerLevelM: 13.5, trend: 'Rapid Rise (+1.1m/hr)', status: 'High Flash Flood Threat' },
  { river: 'Dikrong River (Nirjuli, Papum Pare)', state: 'Arunachal Pradesh', currentLevelM: 8.8, dangerLevelM: 9.5, trend: 'Rising', status: 'Moderate' },
];

export default function WeatherPage() {
  const { weatherStations, simulateCloudburst, isSimulating } = useEOC();
  const [selectedStation, setSelectedStation] = useState(weatherStations[0]);

  const rainfallChartData = weatherStations.map((st) => ({
    name: st.stationName.split(' ')[0],
    rain24h: st.rainfall24hMm,
    forecast: st.forecast24hMm,
    rain7d: st.rainfall7dMm,
  }));

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                PRECIPITATION & METEOROLOGICAL OPERATIONS
              </h1>
              <p className="text-xs text-slate-400">
                IMD Doppler Radar integration, Automatic Weather Stations (AWS) & River Hydrographs
              </p>
            </div>
          </div>
          <button
            onClick={() => simulateCloudburst('East Khasi Hills')}
            disabled={isSimulating}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1.5"
          >
            <CloudLightning className="h-3.5 w-3.5 text-amber-400" />
            <span>Simulate Cherrapunji Deluge</span>
          </button>
        </div>

        {/* AWS Stations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {weatherStations.map((st) => {
            const isSelected = selectedStation.stationId === st.stationId;
            const isHigh = st.rainfall24hMm > 150;

            return (
              <div
                key={st.stationId}
                onClick={() => setSelectedStation(st)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-950/80 border-sky-500 shadow-lg'
                    : isHigh
                    ? 'bg-red-950/30 border-red-900/60 hover:border-red-700'
                    : 'bg-eoc-card border-eoc-border hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {st.district}, {st.state}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      st.imdWarningColor === 'Red'
                        ? 'bg-red-900 text-red-200 animate-pulse'
                        : 'bg-orange-900 text-orange-200'
                    }`}
                  >
                    IMD {st.imdWarningColor}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white mb-2 truncate">
                  {st.stationName}
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">24h Rain</span>
                    <b className="text-sky-300 text-sm">{st.rainfall24hMm} mm</b>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Cloudburst Risk</span>
                    <b className={`${st.cloudburstProbability > 50 ? 'text-red-400' : 'text-amber-400'} text-sm`}>
                      {st.cloudburstProbability}%
                    </b>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Temp: {st.tempC}°C • Hum: {st.humidity}%</span>
                  <span>{st.windSpeedKmh} km/h</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts: Cumulative Rainfall & Hydrograph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* 24h & 7d Rainfall Comparison Bar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                CUMULATIVE PRECIPITATION ACROSS NORTH EAST AWS STATIONS (MM)
              </h3>
              <span className="text-[10px] font-mono text-sky-400">IMD Live AWS Network</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rainfallChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e1726',
                      borderColor: '#1e2f4a',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="rain24h" name="24h Measured Rain (mm)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="forecast" name="Next 24h Forecast (mm)" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Selected Station Deep Telemetry (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white font-mono uppercase">
                  Telemetry: {selectedStation.stationName}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Online & Syncing</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block">Current Hour Intensity</span>
                  <b className="text-lg font-mono text-white">{selectedStation.rainfallCurrentHourMm} mm/hr</b>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">7-Day Cumulative Total</span>
                  <b className="text-lg font-mono text-sky-300">{selectedStation.rainfall7dMm} mm</b>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Atmospheric Pressure</span>
                  <b className="text-sm font-mono text-slate-200">{selectedStation.barometricPressureHpa} hPa</b>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Relative Humidity</span>
                  <b className="text-sm font-mono text-slate-200">{selectedStation.humidity}%</b>
                </div>
              </div>

              <div className="p-3 bg-red-950/40 rounded-lg border border-red-900/60 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Cloudburst & Extreme Rain Assessment</span>
                </div>
                <p className="text-slate-200">
                  {selectedStation.cloudburstProbability > 60
                    ? 'CRITICAL WARNING: Atmospheric moisture convergence indicates severe convective cloudburst potential. Soil absorption capacity exhausted.'
                    : 'MODERATE: Steady monsoon rain with localized heavy squalls. Low slope wash-out risk.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Major River Gauge Hydrological Telemetry */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                MAJOR NORTHEAST RIVER GAUGE STATIONS & FLASH-FLOOD TOE SCOURING
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Central Water Commission (CWC) Stream</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">River Basin & Location</th>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5">Current Stage</th>
                  <th className="p-2.5">Danger Level</th>
                  <th className="p-2.5">Discharge Trend</th>
                  <th className="p-2.5">Toe Scouring Hazard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {RIVER_GAUGES.map((rg, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white font-sans">{rg.river}</td>
                    <td className="p-2.5 text-slate-400">{rg.state}</td>
                    <td className="p-2.5 font-bold text-sky-300">{rg.currentLevelM} m</td>
                    <td className="p-2.5 text-slate-400">{rg.dangerLevelM} m</td>
                    <td className="p-2.5 text-amber-300">{rg.trend}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${rg.currentLevelM >= rg.dangerLevelM ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-slate-800 text-slate-300'}`}>
                        {rg.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
