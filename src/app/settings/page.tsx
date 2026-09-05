'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { 
  Settings as SettingsIcon, 
  Map, 
  Bell, 
  Radio, 
  Globe, 
  PhoneCall, 
  Save, 
  CheckCircle2,
  Shield
} from 'lucide-react';

const HELPLINE_DIRECTORY = [
  { state: 'Assam', agency: 'ASDMA State Emergency Operations Center', phone: '1077 / 0361-2237221', hq: 'Janata Bhawan, Dispur, Guwahati' },
  { state: 'Sikkim', agency: 'Sikkim State Disaster Management Authority', phone: '1070 / 03592-202201', hq: 'Tashiling Secretariat, Gangtok' },
  { state: 'Meghalaya', agency: 'Meghalaya SDMA Central Control Room', phone: '1070 / 0364-2502094', hq: 'Lower Lachumiere, Shillong' },
  { state: 'Nagaland', agency: 'Nagaland SDMA Emergency Cell', phone: '1070 / 0370-2291122', hq: 'Civil Secretariat, Kohima' },
  { state: 'Manipur', agency: 'Manipur Disaster Management Department', phone: '1070 / 0385-2458231', hq: 'Babupara, Imphal' },
  { state: 'Arunachal Pradesh', agency: 'Arunachal Disaster Management Directorate', phone: '1070 / 0360-2212374', hq: 'Civil Secretariat, Itanagar' },
  { state: 'Mizoram', agency: 'Mizoram Disaster Management & Rehabilitation', phone: '1070 / 0389-2334871', hq: 'Chaltlang, Aizawl' },
  { state: 'Tripura', agency: 'Tripura State EOC', phone: '1070 / 0381-2418045', hq: 'Secretariat Complex, Agartala' },
  { state: 'National', agency: 'NDRF 1st Battalion Control Room (Guwahati)', phone: '+91-94350-11223', hq: 'Patgaon, Rani, Kamrup' },
  { state: 'Border Roads', agency: 'BRO Project Swastik Operations Room (Sikkim)', phone: '+91-3592-202911', hq: 'Singtam, Pakyong' },
];

export default function SettingsPage() {
  const { audioAlertsEnabled, toggleAudioAlerts } = useEOC();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [defaultState, setDefaultState] = useState('All NER');
  const [refreshInterval, setRefreshInterval] = useState('15s');
  const [mapStyle, setMapStyle] = useState('CartoDB Dark Matter');
  const [primaryLanguage, setPrimaryLanguage] = useState('English');
  const [smsGateway, setSmsGateway] = useState('Gov-CAP-Gateway-Primary');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <SettingsIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                EOC SYSTEM CONFIGURATION & PREFERENCES
              </h1>
              <p className="text-xs text-slate-400">
                GIS map tiles, CAP gateway routing, notification preferences & regional helpline directory
              </p>
            </div>
          </div>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* GIS & Telemetry Preferences */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-2 border-b border-eoc-border pb-2.5">
                <Map className="h-4 w-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  GIS Map & Telemetry Refresh Settings
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Default Base Tile Provider
                  </label>
                  <select
                    value={mapStyle}
                    onChange={(e) => setMapStyle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="CartoDB Dark Matter">CartoDB Dark Matter (High Contrast EOC Mode)</option>
                    <option value="Esri World Imagery">Esri World Imagery (High Resolution Satellite)</option>
                    <option value="OpenTopoMap">OpenTopoMap (Topographic Contour Lines)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Live Telemetry Ingestion Polling Interval
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono"
                  >
                    <option value="5s">5 Seconds (Emergency Real-time Mode)</option>
                    <option value="15s">15 Seconds (Standard Operations)</option>
                    <option value="60s">60 Seconds (Low Bandwidth Satellite Mode)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Primary Regional Jurisdiction on Startup
                  </label>
                  <select
                    value={defaultState}
                    onChange={(e) => setDefaultState(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="All NER">All North Eastern States (Overview)</option>
                    <option value="Assam">Assam</option>
                    <option value="Sikkim">Sikkim</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Tripura">Tripura</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification & Siren Settings */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center gap-2 border-b border-eoc-border pb-2.5">
                <Bell className="h-4 w-4 text-red-400" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Audio Siren & CAP Dispatch Gateway
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div>
                    <div className="font-semibold text-white">Emergency Siren Audio Alarm</div>
                    <div className="text-[10px] text-slate-400">Play chime when RED Critical failure is triggered</div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleAudioAlerts}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${
                      audioAlertsEnabled ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {audioAlertsEnabled ? 'ENABLED' : 'MUTED'}
                  </button>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Primary CAP-IPAWS SMS Dispatch Route
                  </label>
                  <select
                    value={smsGateway}
                    onChange={(e) => setSmsGateway(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="Gov-CAP-Gateway-Primary">DoT National Disaster SMS Gateway (Priority 1)</option>
                    <option value="Gov-CAP-Gateway-Secondary">BSNL Emergency GSM Network</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Default Bulletin Template Language
                  </label>
                  <select
                    value={primaryLanguage}
                    onChange={(e) => setPrimaryLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                  >
                    <option value="English">English</option>
                    <option value="Assamese">Assamese (অসমীয়া)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-4 w-4" />
                Settings Saved Successfully!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-sky-950 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save EOC Preferences</span>
            </button>
          </div>
        </form>

        {/* Emergency Helpline Directory */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                NORTH EASTERN REGION DISASTER CONTROL ROOM & HELPLINE DIRECTORY
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">24x7 Emergency Contact Nodes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">State / Jurisdiction</th>
                  <th className="p-2.5">Control Center / SDMA Agency</th>
                  <th className="p-2.5">Emergency Helpline Numbers</th>
                  <th className="p-2.5">Headquarters Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {HELPLINE_DIRECTORY.map((dir, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white font-sans">{dir.state}</td>
                    <td className="p-2.5 text-slate-300 font-sans">{dir.agency}</td>
                    <td className="p-2.5 font-bold text-sky-400">{dir.phone}</td>
                    <td className="p-2.5 text-slate-400 font-sans">{dir.hq}</td>
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
