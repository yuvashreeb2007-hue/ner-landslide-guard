'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { Sensor, SensorType, SensorStatus } from '@/types';
import { 
  ActivitySquare, 
  Battery, 
  Wifi, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Sliders,
  CheckCircle2,
  Wrench,
  TrendingUp,
  MapPin
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';

export default function SensorsPage() {
  const { sensors, eocStats } = useEOC();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [calibratingSensor, setCalibratingSensor] = useState<Sensor | null>(null);
  const [calibrationSuccess, setCalibrationSuccess] = useState(false);

  const filteredSensors = sensors.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleRunCalibration = () => {
    setTimeout(() => {
      setCalibrationSuccess(true);
      setTimeout(() => {
        setCalibrationSuccess(false);
        setCalibratingSensor(null);
      }, 1500);
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ActivitySquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                GEOTECHNICAL IOT SENSOR TELEMETRY FLEET
              </h1>
              <p className="text-xs text-slate-400">
                Inclinometers, Piezometers, Crackmeters & Soil Moisture probes across critical slopes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-emerald-400 font-bold">
              ● {eocStats.sensorsOnline}/{eocStats.totalSensors} Online ({eocStats.trends.sensorsOnlinePercent}%)
            </span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-eoc-card p-3.5 rounded-xl border border-eoc-border text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sensor ID, hill location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Sensor Types</option>
              <option value="Inclinometer">Inclinometers (Displacement)</option>
              <option value="Piezometer">Piezometers (Pore Pressure)</option>
              <option value="Soil Moisture">Soil Moisture (TDR)</option>
              <option value="Crackmeter">Crackmeters (Aperture)</option>
              <option value="Tiltmeter">Tiltmeters (Rotation)</option>
              <option value="Rain Gauge">Solar Rain Gauges</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Health Statuses</option>
              <option value="Critical">Critical Threshold</option>
              <option value="Warning">Warning</option>
              <option value="Online">Online Normal</option>
            </select>
          </div>
        </div>

        {/* Sensors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredSensors.map((sensor) => {
            const isCrit = sensor.status === 'Critical';
            const isWarn = sensor.status === 'Warning';

            return (
              <div
                key={sensor.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isCrit
                    ? 'bg-red-950/30 border-red-800/80 shadow-lg shadow-red-950/40'
                    : isWarn
                    ? 'bg-amber-950/30 border-amber-800/80'
                    : 'bg-eoc-card border-eoc-border'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {sensor.type}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        isCrit
                          ? 'bg-red-900 text-red-100 border-red-700 animate-pulse'
                          : isWarn
                          ? 'bg-amber-900 text-amber-100 border-amber-700'
                          : 'bg-emerald-900 text-emerald-100 border-emerald-700'
                      }`}
                    >
                      {sensor.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1">{sensor.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                    <span className="truncate">{sensor.locationName}, {sensor.district}</span>
                  </div>

                  {/* Big Telemetry Value */}
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 mb-3">
                    <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>CURRENT READING</span>
                      <span className="text-sky-400">Trend: {sensor.trend}</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className={`text-2xl font-mono font-black ${isCrit ? 'text-red-400' : 'text-sky-300'}`}>
                        {sensor.currentValue}
                      </span>
                      <span className="text-[10px] text-slate-400">{sensor.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Safe Baseline: {sensor.normalRange[0]}–{sensor.normalRange[1]} • Crit &gt; {sensor.criticalThreshold}
                    </div>
                  </div>

                  {/* 6-Hour Micro Sparkline Chart */}
                  <div className="h-16 w-full mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sensor.readingsHistory}>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#080c14',
                            borderColor: '#1e2f4a',
                            fontSize: '10px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={isCrit ? '#ef4444' : '#38bdf8'}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Footer Telemetry Stats & Diagnose button */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Battery className="h-3 w-3 text-emerald-400" />
                      {sensor.batteryLevel}% Bat
                    </span>
                    <span className="flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-sky-400" />
                      {sensor.signalStrength}% GSM
                    </span>
                    <span>{sensor.lastTransmission}</span>
                  </div>

                  <button
                    onClick={() => setCalibratingSensor(sensor)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Wrench className="h-3 w-3 text-sky-400" />
                    <span>Run Diagnostic & Calibration</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sensor Calibration Modal */}
        {calibratingSensor && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-eoc-border pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Sensor Diagnostic Node
                  </h3>
                </div>
                <button
                  onClick={() => setCalibratingSensor(null)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">TARGET SENSOR:</div>
                  <div className="font-bold text-white text-sm">{calibratingSensor.name}</div>
                  <div className="text-sky-400 font-mono text-[11px] mt-0.5">
                    ID: {calibratingSensor.id} • Type: {calibratingSensor.type}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-eoc-surface p-2 rounded border border-eoc-border">
                    <span className="text-slate-400 block font-sans">Battery Voltage:</span>
                    <b className="text-emerald-400">{calibratingSensor.batteryLevel}% (3.82V Li-ion)</b>
                  </div>
                  <div className="bg-eoc-surface p-2 rounded border border-eoc-border">
                    <span className="text-slate-400 block font-sans">LoRa Gateway RSSI:</span>
                    <b className="text-sky-300">-68 dBm (Excellent)</b>
                  </div>
                </div>

                {calibrationSuccess ? (
                  <div className="bg-emerald-950/80 text-emerald-200 border border-emerald-700 p-3 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Zero-Point Calibration Verified Successfully!</span>
                  </div>
                ) : (
                  <p className="text-slate-300 text-[11px]">
                    This procedure performs a remote zero-point balance reset and tests analog-to-digital converter (ADC) response across the LoRaWAN telemetry network.
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setCalibratingSensor(null)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunCalibration}
                  disabled={calibrationSuccess}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-950"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Execute Diagnostic Ping</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
