'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useEOC } from '@/context/EOCContext';
import { LandslideMap } from '@/components/map/LandslideMap';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { 
  Users, 
  Send, 
  MapPin, 
  AlertTriangle, 
  CloudRain, 
  ShieldCheck, 
  PhoneCall, 
  Compass, 
  BookOpen, 
  Layers, 
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

export default function CitizenPortalPage() {
  const { user } = useAuth();
  const { alerts, riskZones, weatherStations } = useEOC();

  const [activeTab, setActiveTab] = useState<'overview' | 'guidance' | 'helplines'>('overview');

  const activeAlerts = alerts.filter(a => a.status === 'Active');

  const safetyGuidelines = [
    {
      title: 'Warning Signs of an Impending Landslide',
      items: [
        'Springs, seeps, or saturated ground appearing in areas that are typically dry.',
        'New cracks or unusual bulges appearing in the ground, paved roads, or building foundations.',
        'Tilting or leaning trees, utility telephone poles, or boundary retaining fences.',
        'Sudden decrease or increase in stream water flow, accompanied by muddy discoloration.',
        'Faint rumbling sounds that gradually increase in volume as the slide approaches.'
      ]
    },
    {
      title: 'What To Do Before & During Heavy Monsoon Rainfall',
      items: [
        'Stay alert and awake during intense storms; many landslide fatalities occur when people are sleeping.',
        'Listen for emergency radio bulletins and local WhatsApp disaster warning groups.',
        'Never cross road stretches covered in fast-moving mud or mountain torrents.',
        'If you notice slope movement or rockfall, evacuate uphill/perpendicular to the slide path immediately.'
      ]
    },
    {
      title: 'Evacuation Preparedness & Emergency Kit',
      items: [
        'Maintain a waterproof grab-bag with copies of identity cards, medical prescriptions, and battery torch.',
        'Store portable battery bank for mobile phone communication.',
        'Know your village / ward pre-designated high-ground relief shelter.'
      ]
    }
  ];

  const helplines = [
    { state: 'Assam', number: '1077 / 0361-2237221', agency: 'ASDMA Emergency Control Room' },
    { state: 'Sikkim', number: '1070 / 03592-202201', agency: 'SSDMA State Control Center' },
    { state: 'Meghalaya', number: '1070 / 0364-2502094', agency: 'Meghalaya SDMA Helpline' },
    { state: 'Nagaland', number: '1070 / 0370-2291122', agency: 'NSDMA Operations Room' },
    { state: 'National NDRF', number: '+91-94350-11223', agency: '1st Battalion NDRF Control Room (Guwahati)' },
    { state: 'Police & Ambulance', number: '112 / 108', agency: 'National Emergency Support System' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Citizen Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-inner">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-2xl font-black text-white font-mono tracking-wide">
                  CITIZEN & COMMUNITY SAFETY PORTAL
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                  PUBLIC SAFETY
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Welcome, <strong className="text-white">{user?.full_name || 'Citizen Volunteer'}</strong>. Real-time landslide hazard advisories, monsoon rain forecasts, and community incident reporting.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/field-report"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <Send className="h-4 w-4" />
              <span>Submit Hazard Report</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Public Risk Map & Live Advisories</span>
          </button>

          <button
            onClick={() => setActiveTab('guidance')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'guidance'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Safety Guidance & Evacuation</span>
          </button>

          <button
            onClick={() => setActiveTab('helplines')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              activeTab === 'helplines'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Emergency Helplines (24x7)</span>
          </button>
        </div>

        {/* Tab 1: Overview & Map */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Active Public Advisories Strip */}
            {activeAlerts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase">
                  <Radio className="h-4 w-4 animate-pulse" />
                  <span>Active Civil Defense Bulletins ({activeAlerts.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeAlerts.map(alert => (
                    <div key={alert.id} className="p-3.5 bg-red-950/30 border border-red-900/60 rounded-xl space-y-1.5 shadow">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{alert.title}</span>
                        <SeverityBadge level={alert.riskLevel} size="sm" />
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{alert.reason}</p>
                      <div className="text-[10px] text-amber-300 font-mono pt-1">
                        SOP: {alert.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Public GIS Map */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase">
                    Public Hazard & Monsoon Risk Zones
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Real-time IMD & GSI Multi-layer Overlay</span>
              </div>

              <LandslideMap heightClass="h-[440px]" />
            </div>

            {/* Nearby Weather & Rainfall Overview */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                <CloudRain className="h-4 w-4 text-sky-400" />
                <span>Regional Automatic Weather Station (AWS) Rainfall Telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {weatherStations.slice(0, 4).map((ws) => (
                  <div key={ws.stationId} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{ws.stationName}</span>
                      <span className="text-sky-400 font-mono">{ws.tempC}°C</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      24h Rain: <strong className="text-white font-mono">{ws.rainfall24hMm} mm</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      IMD Alert: {ws.imdWarningColor} • Humidity: {ws.humidity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Safety Guidance */}
        {activeTab === 'guidance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safetyGuidelines.map((guide, idx) => (
              <div key={idx} className="bg-eoc-card border border-eoc-border rounded-xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{guide.title}</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {guide.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Helplines */}
        {activeTab === 'helplines' && (
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <span>24x7 State Disaster Management & Emergency Helpline Directory</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {helplines.map((hl, idx) => (
                <div key={idx} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-white text-xs">{hl.state}</div>
                  <div className="text-base font-black text-emerald-400 font-mono">{hl.number}</div>
                  <div className="text-[10px] text-slate-400">{hl.agency}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
