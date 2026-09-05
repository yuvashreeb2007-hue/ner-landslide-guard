'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Plus, 
  Key, 
  Server,
  RefreshCw,
  Lock
} from 'lucide-react';

const MOCK_USERS = [
  { name: 'Dr. Mukul Sharma', role: 'Chief EOC Commander', agency: 'NEC & ASDMA', email: 'mukul.sharma@asdma.gov.in', status: 'Active', access: 'Superadmin' },
  { name: 'Er. Tsering Bhutia', role: 'Superintending Engineer', agency: 'BRO Project Swastik', email: 't.bhutia@bro.gov.in', status: 'Active', access: 'Operations' },
  { name: 'Dr. Kezhavilie Angami', role: 'Senior Geologist', agency: 'GSI Northeast Node', email: 'k.angami@gsi.gov.in', status: 'Active', access: 'Analytics' },
  { name: 'Nabanita Das, IAS', role: 'District Collector', agency: 'Kamrup Metro DDMA', email: 'dc-kamrup@assam.gov.in', status: 'Active', access: 'District Admin' },
  { name: 'Inspector P. Marbaniang', role: 'Rescue Operations Lead', agency: 'Meghalaya SDRF', email: 'p.marbaniang@sdrf.gov.in', status: 'Active', access: 'Response' },
];

const DATA_SOURCES = [
  { name: 'IMD Doppler Weather Radar Feed (Guwahati, Mohanbari, Sohra)', type: 'Doppler Radar Ingestion', latency: '45s', syncStatus: 'Healthy', throughput: '1.2 GB/hr' },
  { name: 'ESA Sentinel-1 & ALOS-2 InSAR Surface Deformation', type: 'SAR Interferometry', latency: '6 Hours', syncStatus: 'Healthy', throughput: '8.4 GB/day' },
  { name: 'Northeast LoRaWAN Geotechnical IoT Hub (148 Nodes)', type: 'IoT Telemetry Stream', latency: '1.8s', syncStatus: 'Healthy', throughput: '420 msgs/min' },
  { name: 'GSI National Landslide Susceptibility Mapping (NLSM) Atlas', type: 'Spatial Hazard Layers', latency: 'Synced', syncStatus: 'Healthy', throughput: 'Static WMS' },
  { name: 'National Disaster Management Authority CAP-IPAWS Gateway', type: 'Emergency Broadcast Multi-cast', latency: '120ms', syncStatus: 'Operational', throughput: 'Ready' },
];

export default function AdminPage() {
  const { eocStats } = useEOC();

  const [rules, setRules] = useState([
    { id: 'RL-01', name: 'Extreme Cloudburst Auto-Red-Alert', condition: 'Precipitation > 65 mm/hr AND Slope > 40°', action: 'Auto-broadcast CAP Red Alert & SMS to geofenced towers', enabled: true },
    { id: 'RL-02', name: 'Inclinometer Shear Slip Alarm', condition: 'Displacement Rate > 5.0 mm/day', action: 'Dispatch SDRF Technical Scout & Alert District Collector', enabled: true },
    { id: 'RL-03', name: 'Pore-Water Surcharge Trigger', condition: 'Pore Pressure > 60 kPa OR Soil Saturation > 90%', action: 'Elevate Hazard Score to CRITICAL and restrict highway transit', enabled: true },
    { id: 'RL-04', name: 'Citizen Report Multi-Confirmation', condition: '3+ verified citizen reports within 2 km radius in 1 hour', action: 'Auto-generate P1 Priority Incident in Command Board', enabled: true },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                OPERATIONS ADMINISTRATION & SYSTEM HEALTH
              </h1>
              <p className="text-xs text-slate-400">
                User access control, Data pipeline sync metrics & Automated AI threshold rule engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-emerald-400 font-bold flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" />
              System Health: 99.98% Uptime
            </span>
          </div>
        </div>

        {/* 1. System Health Telemetry Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-eoc-surface p-3 rounded-xl border border-eoc-border">
            <span className="text-[10px] text-slate-400 block font-sans">API Latency</span>
            <b className="text-lg text-sky-400">42 ms</b>
            <div className="text-[10px] text-emerald-400 mt-0.5">● Optimal response</div>
          </div>

          <div className="bg-eoc-surface p-3 rounded-xl border border-eoc-border">
            <span className="text-[10px] text-slate-400 block font-sans">Active IoT Gateways</span>
            <b className="text-lg text-white">12 / 12 Nodes</b>
            <div className="text-[10px] text-emerald-400 mt-0.5">100% Connected</div>
          </div>

          <div className="bg-eoc-surface p-3 rounded-xl border border-eoc-border">
            <span className="text-[10px] text-slate-400 block font-sans">CAP Broadcast Queue</span>
            <b className="text-lg text-emerald-300">0 Pending</b>
            <div className="text-[10px] text-slate-400 mt-0.5">Throughput: 15k/sec</div>
          </div>

          <div className="bg-eoc-surface p-3 rounded-xl border border-eoc-border">
            <span className="text-[10px] text-slate-400 block font-sans">AI Inference Worker</span>
            <b className="text-lg text-purple-300">TensorFlow v2.16</b>
            <div className="text-[10px] text-slate-400 mt-0.5">Batch interval: 60s</div>
          </div>
        </div>

        {/* 2. Automated AI Alert Rules & Threshold Engine */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                AUTOMATED AI EARLY WARNING THRESHOLD RULE ENGINE
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Autonomous Event Triggers</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {rules.map((rule) => (
              <div key={rule.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sky-400 font-bold text-[10px] bg-sky-950 px-1.5 py-0.5 rounded border border-sky-800">
                      {rule.id}
                    </span>
                    <h4 className="font-bold text-white text-xs">{rule.name}</h4>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <span className="text-amber-400 font-mono">IF:</span> {rule.condition}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-sky-400 font-mono">THEN:</span> {rule.action}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-mono font-bold uppercase ${rule.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {rule.enabled ? 'RULE ACTIVE' : 'DISABLED'}
                  </span>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 relative ${
                      rule.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Data Sources & Ingestion Sync Pipeline */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                EXTERNAL GEOSPATIAL & METEOROLOGICAL DATA INGESTION PIPELINES
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">All Streams Synchronized</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Data Ingestion Pipeline</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Telemetry Latency</th>
                  <th className="p-2.5">Data Throughput</th>
                  <th className="p-2.5">Sync Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {DATA_SOURCES.map((ds, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white font-sans">{ds.name}</td>
                    <td className="p-2.5 text-slate-400">{ds.type}</td>
                    <td className="p-2.5 text-sky-300">{ds.latency}</td>
                    <td className="p-2.5 text-slate-300">{ds.throughput}</td>
                    <td className="p-2.5">
                      <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-800">
                        {ds.syncStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Authorized EOC Personnel & Role Management */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                AUTHORIZED DISASTER MANAGEMENT COMMAND PERSONNEL
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Role-Based Access Control (RBAC)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Officer Name</th>
                  <th className="p-2.5">Role / Position</th>
                  <th className="p-2.5">Agency / Department</th>
                  <th className="p-2.5">Official Email</th>
                  <th className="p-2.5">Access Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {MOCK_USERS.map((usr, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white font-sans">{usr.name}</td>
                    <td className="p-2.5 text-slate-300 font-sans">{usr.role}</td>
                    <td className="p-2.5 text-sky-400 font-sans">{usr.agency}</td>
                    <td className="p-2.5 text-slate-400">{usr.email}</td>
                    <td className="p-2.5">
                      <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-700">
                        {usr.access}
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
