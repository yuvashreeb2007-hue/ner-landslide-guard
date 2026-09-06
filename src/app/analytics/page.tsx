'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEOC } from '@/context/EOCContext';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Layers, 
  PieChart as PieIcon,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { MOCK_HISTORICAL_INCIDENTS_BY_MONTH, MOCK_STATE_RISK_SUMMARY } from '@/data/mockData';

const LITHOLOGY_STATS = [
  { formation: 'Disang Group Shales & Flysch', share: 38, incidentsCount: 642, riskFactor: 'High Weathering Plasticity' },
  { formation: 'Daling Phyllites & Quartzites', share: 26, incidentsCount: 438, riskFactor: 'Sheared Foliation Slip' },
  { formation: 'Siwalik Fragile Sandstone', share: 18, incidentsCount: 304, riskFactor: 'Unconsolidated Toe Erosion' },
  { formation: 'Surma & Tipam Sandstone', share: 12, incidentsCount: 202, riskFactor: 'Daylighting Bedding Planes' },
  { formation: 'Precambrian Gneiss Overburden', share: 6, incidentsCount: 102, riskFactor: 'Thick Laterite Soil Creep' },
];

export default function AnalyticsPage() {
  const { eocStats, riskZones, alerts, incidents } = useEOC();
  const [showSitrepModal, setShowSitrepModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <ProtectedRoute 
        requiredRoles={['ADMIN', 'DISTRICT_OFFICER']} 
        moduleName="Disaster Operations Data Analytics & Forensics"
      >
        <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                DISASTER ANALYTICS & HISTORICAL GSI INVENTORY
              </h1>
              <p className="text-xs text-slate-400">
                1990–2026 GSI Landslide Atlas, Monsoon Correlation & Daily Situation Report (SITREP) Engine
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSitrepModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-sky-950 transition-all self-start md:self-auto"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Generate Daily SITREP</span>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Monsoon Surge Correlation Chart */}
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-eoc-border pb-2.5 mb-3">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                HISTORICAL MONSOON PRECIPITATION VS. LANDSLIDE FREQUENCY
              </h3>
              <span className="text-[10px] font-mono text-slate-400">10-Year Climatology</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_HISTORICAL_INCIDENTS_BY_MONTH} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
                  <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e1726',
                      borderColor: '#1e2f4a',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="rainfallMm"
                    name="Mean Rainfall (mm)"
                    stroke="#38bdf8"
                    fill="#38bdf8"
                    fillOpacity={0.25}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="incidents"
                    name="Recorded Landslides"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#ef4444' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lithological Formation Vulnerability */}
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
            <div className="border-b border-eoc-border pb-2.5 mb-3">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                GEOLOGICAL FORMATION VULNERABILITY IN NORTH EAST INDIA
              </h3>
              <p className="text-[10px] text-slate-400">
                Susceptibility distribution based on Geological Survey of India (GSI) lithology
              </p>
            </div>

            <div className="space-y-2.5 py-1 text-xs">
              {LITHOLOGY_STATS.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200">{item.formation}</span>
                    <span className="font-mono text-sky-400 font-bold">{item.share}% ({item.incidentsCount} events)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0
                          ? 'bg-red-500'
                          : idx === 1
                          ? 'bg-orange-500'
                          : idx === 2
                          ? 'bg-amber-500'
                          : 'bg-sky-500'
                      }`}
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Primary Trigger Mechanism: <span className="text-slate-300">{item.riskFactor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* State-by-State Exposure Ranking */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              NORTH EASTERN REGION STATE RISK & POPULATION EXPOSURE MATRIX
            </h3>
            <span className="text-[10px] font-mono text-sky-400">Census 2026 Overlay</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5">Critical Risk Zones</th>
                  <th className="p-2.5">High Risk Zones</th>
                  <th className="p-2.5">Blocked Highways</th>
                  <th className="p-2.5">Population at Hazard Risk</th>
                  <th className="p-2.5">24h Mean Rain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {MOCK_STATE_RISK_SUMMARY.map((st, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white font-sans">{st.state}</td>
                    <td className="p-2.5">
                      <span className="bg-red-950 text-red-400 px-2 py-0.5 rounded font-bold">
                        {st.criticalZones}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="bg-orange-950 text-orange-400 px-2 py-0.5 rounded font-bold">
                        {st.highRisk}
                      </span>
                    </td>
                    <td className="p-2.5 text-amber-300">{st.roadsBlocked}</td>
                    <td className="p-2.5 font-sans font-semibold text-slate-200">
                      {(st.populationExposedK * 1000).toLocaleString()} Pax
                    </td>
                    <td className="p-2.5 text-sky-300">{st.avgRainfall} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Situation Report (SITREP) Modal */}
        {showSitrepModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-eoc-border pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-sky-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase">
                      DAILY EMERGENCY SITUATION REPORT (SITREP)
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      Document Ref: NER-EOC-SITREP-2026-09-05-1800
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowSitrepModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-sky-400 uppercase font-bold">Executive Overview:</div>
                  <p>
                    Torrential orographic monsoon rainfall continues across southern Meghalaya, Sikkim, and the Borail hill ranges of Assam. A total of <b>{eocStats.activeCriticalZones} Critical</b> and <b>{eocStats.highRiskZones} High</b> risk zones are under active radar and IoT telemetry watch.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-eoc-surface p-2.5 rounded border border-eoc-border">
                    <span className="text-[10px] text-slate-400 block font-sans">Active CAP Bulletins</span>
                    <b className="text-red-400 text-lg">{eocStats.activeAlerts}</b>
                  </div>
                  <div className="bg-eoc-surface p-2.5 rounded border border-eoc-border">
                    <span className="text-[10px] text-slate-400 block font-sans">Highway Lifelines Blocked</span>
                    <b className="text-amber-400 text-lg">{eocStats.roadsBlocked}</b>
                  </div>
                  <div className="bg-eoc-surface p-2.5 rounded border border-eoc-border">
                    <span className="text-[10px] text-slate-400 block font-sans">NDRF/SDRF Deployed</span>
                    <b className="text-sky-300 text-lg">{eocStats.activeResponseTeams} Units</b>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-1">Key Operational Priorities:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    <li><b>NH-10 (Siliguri-Gangtok):</b> BRO Project Swastik clearing 4,500 m³ debris slide at 29th Mile. ETA 18 hours.</li>
                    <li><b>NH-29 (Kohima-Imphal):</b> Dzüdza river road subsidence under emergency rock-bolting. Detour via Jotsoma active.</li>
                    <li><b>Dima Hasao Railway Section:</b> Lumding-Badarpur trains suspended due to active deep slope creep at Haflong.</li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => setShowSitrepModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-lg shadow-sky-950"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / Export SITREP PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
