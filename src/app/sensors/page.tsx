'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useSensorFleet, SensorData } from '@/services/sensor';
import { SensorKPICards } from '@/components/sensors/SensorKPICards';
import { SensorSimulatorControls } from '@/components/sensors/SensorSimulatorControls';
import { SensorAnalyticsCharts } from '@/components/sensors/SensorAnalyticsCharts';
import { SensorDataTable } from '@/components/sensors/SensorDataTable';
import { useI18n } from '@/context/I18nContext';
import { 
  ActivitySquare, 
  Cpu, 
  Radio, 
  ShieldCheck, 
  RefreshCw,
  Layers,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function SensorsPage() {
  const { t } = useI18n();
  const { sensors, kpis, isLoading, setScenario, triggerTick } = useSensorFleet();
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);

  return (
    <MainLayout>
      <ProtectedRoute 
        requiredRoles={['ADMIN', 'DISTRICT_OFFICER']} 
        moduleName="Geotechnical Sensor Fleet & IoT Telemetry Telematics"
      >
        <div className="space-y-6">
        {/* Operations Header */}
        <div className="bg-eoc-card p-4 md:p-5 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-inner">
              <ActivitySquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                  {t('sensors.title')}
                </h1>
                <span className="bg-emerald-900/40 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-700/50">
                  {t('sensors.meshLive')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('sensors.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/map"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Layers className="h-4 w-4 text-sky-400" />
              <span>{t('dashboard.expandedMap')}</span>
            </Link>
          </div>
        </div>

        {/* 1. Sensor Fleet Status Summary KPI Cards */}
        <SensorKPICards kpis={kpis} />

        {/* 2. Interactive Sensor Simulator & Telemetry Pulse Controller */}
        <SensorSimulatorControls
          onSetScenario={(sc) => setScenario(sc)}
          onTriggerTick={() => triggerTick()}
        />

        {/* 3. 4 Real-time Telemetry Charts: Soil Moisture, Rainfall, Tilt, Battery/Signal */}
        {sensors.length > 0 && <SensorAnalyticsCharts sensors={sensors} />}

        {/* 4. Complete Filterable & Searchable Sensor Fleet Table */}
        <SensorDataTable
          sensors={sensors}
          selectedSensor={selectedSensor}
          onSelectSensor={(s) => setSelectedSensor(s)}
        />
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
