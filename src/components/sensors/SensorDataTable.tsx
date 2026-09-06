'use client';

import React, { useState } from 'react';
import { SensorData, SensorType, SensorStatus } from '@/services/sensor/types';
import { useI18n } from '@/context/I18nContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Battery, 
  Wifi, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Flame, 
  ChevronRight, 
  Layers, 
  X,
  CheckCircle2,
  AlertTriangle,
  Wrench
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis
} from 'recharts';

interface SensorDataTableProps {
  sensors: SensorData[];
  selectedSensor: SensorData | null;
  onSelectSensor: (sensor: SensorData | null) => void;
}

export function SensorDataTable({
  sensors,
  selectedSensor,
  onSelectSensor,
}: SensorDataTableProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [calibratingId, setCalibratingId] = useState<string | null>(null);

  const filtered = sensors.filter((s) => {
    const matchesSearch =
      s.sensorId.toLowerCase().includes(search.toLowerCase()) ||
      s.district.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || s.sensorType === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCalibrate = (sensorId: string) => {
    setCalibratingId(sensorId);
    setTimeout(() => {
      setCalibratingId(null);
    }, 1500);
  };

  const getStatusLabel = (status: SensorStatus) => {
    switch (status) {
      case 'ONLINE': return t('sensors.online');
      case 'WARNING': return t('sensors.warning');
      case 'CRITICAL': return t('sensors.critical');
      case 'OFFLINE': return t('sensors.offline');
      default: return status;
    }
  };

  return (
    <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-xl overflow-hidden space-y-4 p-4">
      {/* Header with Search and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-eoc-border pb-3">
        <div>
          <h3 className="text-xs md:text-sm font-bold text-white uppercase font-mono tracking-wider">
            IoT GEOTECHNICAL SENSOR FLEET MATRIX ({filtered.length} NODES)
          </h3>
          <p className="text-[10px] text-slate-400">
            Real-time telemetry stream across landslide-prone corridors in Northeast India
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-sky-500 font-mono w-48 sm:w-56"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
          >
            <option value="ALL">{t('common.all')} ({t('sensors.colType')})</option>
            <option value="Soil Moisture">{t('sensors.types.soilMoisture')}</option>
            <option value="Slope Tilt">{t('sensors.types.slopeTilt')}</option>
            <option value="Rain Gauge">{t('sensors.types.rainGauge')}</option>
            <option value="Ground Movement">{t('sensors.types.groundMovement')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
          >
            <option value="ALL">{t('common.all')} ({t('sensors.colStatus')})</option>
            <option value="ONLINE">{t('sensors.online')}</option>
            <option value="WARNING">{t('sensors.warning')}</option>
            <option value="CRITICAL">{t('sensors.critical')}</option>
            <option value="OFFLINE">{t('sensors.offline')}</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">{t('sensors.colSensorId')} / {t('sensors.colStatus')}</th>
              <th className="p-3">{t('sensors.colDistrict')}</th>
              <th className="p-3">{t('sensors.colType')}</th>
              <th className="p-3">{t('sensors.colCurrentValue')}</th>
              <th className="p-3">{t('sensors.colThreshold')}</th>
              <th className="p-3">{t('sensors.colBattery')} / {t('sensors.colSignal')}</th>
              <th className="p-3">Trend</th>
              <th className="p-3">{t('sensors.colLastUpdated')}</th>
              <th className="p-3 text-right">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filtered.map((s) => {
              const isSelected = selectedSensor?.sensorId === s.sensorId;
              const isCrit = s.status === 'CRITICAL';
              const isWarn = s.status === 'WARNING';
              const isOff = s.status === 'OFFLINE';

              return (
                <tr
                  key={s.sensorId}
                  onClick={() => onSelectSensor(s)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-950/70 border-l-4 border-l-sky-400'
                      : isCrit
                      ? 'bg-red-950/20 hover:bg-red-950/40'
                      : isWarn
                      ? 'bg-amber-950/15 hover:bg-amber-950/30'
                      : 'hover:bg-slate-900/50'
                  }`}
                >
                  {/* ID & Status */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                          isCrit
                            ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                            : isWarn
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : isOff
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {getStatusLabel(s.status)}
                      </span>
                      <span className="font-bold text-white text-xs">{s.sensorId}</span>
                    </div>
                  </td>

                  {/* Location & District */}
                  <td className="p-3">
                    <div className="font-sans font-semibold text-slate-200 text-xs max-w-[200px] truncate">
                      {s.location}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-sky-400" />
                      {s.district}, {s.state}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-3">
                    <span className="text-sky-300 font-sans font-semibold">{s.sensorType}</span>
                    {s.installationDepthM && (
                      <span className="text-[10px] text-slate-500 block">Depth: {s.installationDepthM}m</span>
                    )}
                  </td>

                  {/* Current Value */}
                  <td className="p-3">
                    <span
                      className={`text-sm font-black ${
                        isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {s.currentValue} {s.unit}
                    </span>
                  </td>

                  {/* Safety Threshold */}
                  <td className="p-3 text-slate-400">
                    <span>{s.threshold} {s.unit}</span>
                  </td>

                  {/* Battery / Signal */}
                  <td className="p-3">
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className={`flex items-center gap-1 ${s.battery < 25 ? 'text-red-400' : 'text-slate-300'}`}>
                        <Battery className="h-3 w-3" />
                        {s.battery}%
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Wifi className="h-3 w-3 text-indigo-400" />
                        {s.signalStrength}%
                      </span>
                    </div>
                  </td>

                  {/* Trend */}
                  <td className="p-3">
                    {s.trend === 'CRITICAL_SURGE' ? (
                      <span className="text-red-400 flex items-center gap-1 text-[10px] font-bold">
                        <Flame className="h-3 w-3" />
                        Surge
                      </span>
                    ) : s.trend === 'RISING' ? (
                      <span className="text-amber-400 flex items-center gap-1 text-[10px]">
                        <TrendingUp className="h-3 w-3" />
                        Rising
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                        <Minus className="h-3 w-3" />
                        Stable
                      </span>
                    )}
                  </td>

                  {/* Last Sync */}
                  <td className="p-3 text-slate-400 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {new Date(s.lastUpdated).toLocaleTimeString()}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSensor(s);
                      }}
                      className="px-2 py-1 bg-slate-800 hover:bg-sky-900 text-sky-300 rounded text-[10px] font-sans font-semibold inline-flex items-center gap-1 transition-all"
                    >
                      <span>{t('common.details')}</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Sensor Detail Drawer / Modal */}
      {selectedSensor && (
        <div className="bg-slate-950/90 border border-sky-900/60 rounded-xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded uppercase">
                {selectedSensor.sensorType}
              </span>
              <h4 className="text-xs font-bold text-white font-mono">
                {selectedSensor.sensorId} — {selectedSensor.location}
              </h4>
            </div>
            <button
              onClick={() => onSelectSensor(null)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">{t('sensors.colCurrentValue')}</span>
              <span className="text-xl font-black font-mono text-sky-400">
                {selectedSensor.currentValue} {selectedSensor.unit}
              </span>
              <span className="text-[10px] text-slate-500 block">{t('sensors.colThreshold')}: {selectedSensor.threshold} {selectedSensor.unit}</span>
            </div>

            <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Geographic Location</span>
              <span className="font-bold text-slate-200 block truncate">{selectedSensor.district}, {selectedSensor.state}</span>
              <span className="text-[10px] text-slate-500 font-mono block">
                Lat: {selectedSensor.latitude.toFixed(4)}, Lng: {selectedSensor.longitude.toFixed(4)}
              </span>
            </div>

            <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Hardware Telemetry</span>
              <div className="flex items-center justify-between font-mono">
                <span>{t('sensors.colBattery')}: <b className="text-emerald-400">{selectedSensor.battery}%</b></span>
                <span>{t('sensors.colSignal')}: <b className="text-indigo-400">{selectedSensor.signalStrength}%</b></span>
              </div>
              <span className="text-[10px] text-slate-500 block">{t('sensors.colStatus')}: {getStatusLabel(selectedSensor.status)}</span>
            </div>

            <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Maintenance & Calibration</span>
              <button
                onClick={() => handleCalibrate(selectedSensor.sensorId)}
                disabled={calibratingId === selectedSensor.sensorId}
                className="w-full mt-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-xs rounded border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <Wrench className={`h-3.5 w-3.5 ${calibratingId === selectedSensor.sensorId ? 'animate-spin' : ''}`} />
                <span>{calibratingId === selectedSensor.sensorId ? 'Recalibrating Zero Point...' : 'Zero-Point Calibration'}</span>
              </button>
            </div>
          </div>

          {/* Sparkline Time-Series in Drawer */}
          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1.5">
              Live Rolling Telemetry Stream ({selectedSensor.history.length} samples)
            </span>
            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedSensor.history}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e1726',
                      borderColor: '#1e2f4a',
                      borderRadius: '6px',
                      fontSize: '10px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={`Reading (${selectedSensor.unit})`}
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
