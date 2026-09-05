'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { Alert } from '@/types';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { 
  AlertOctagon, 
  Radio, 
  Send, 
  CheckCircle2, 
  Volume2, 
  Smartphone, 
  MessageSquare, 
  RadioTower, 
  Clock, 
  MapPin, 
  Search, 
  Plus, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { NER_STATES } from '@/data/mockData';

export default function AlertsPage() {
  const { alerts, createEmergencyAlert, acknowledgeAlert } = useEOC();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Assamese' | 'Bengali' | 'Hindi'>('English');

  const [formData, setFormData] = useState({
    title: 'RED ALERT: Extreme Slope Failure Warning & Highway Severance',
    severity: 'RED' as const,
    riskLevel: 'CRITICAL' as const,
    state: 'Sikkim' as any,
    affectedDistrict: 'Pakyong & Mangan Districts',
    affectedVillages: 'Singtam, 29th Mile, Chungthang',
    reason: 'Antecedent precipitation exceeding critical geotechnical threshold. Inclinometers indicate rapid displacement.',
    validUntil: 'Next 24 Hours',
    recommendedAction: 'Mandatory preventive evacuation to designated community shelters. Total highway curfew.',
    issuedBy: 'NER LandslideGuard & GSI Joint Early Warning Node',
    capChannel: ['SMS', 'WhatsApp', 'Community Siren', 'Radio Broadcast'] as any,
  });

  const filteredAlerts = alerts.filter((alt) => {
    const matchesSearch =
      alt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.affectedDistrict.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || alt.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    createEmergencyAlert({
      ...formData,
      affectedVillages: formData.affectedVillages.split(',').map((s) => s.trim()),
    });
    setShowNewModal(false);
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                EMERGENCY WARNING & CAP BROADCAST DISSEMINATION
              </h1>
              <p className="text-xs text-slate-400">
                Common Alerting Protocol (CAP-IPAWS), Cell-Broadcast SMS, Community Sirens & WhatsApp Gateways
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-950 transition-all self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Generate CAP Bulletin</span>
          </button>
        </div>

        {/* Multi-Channel Broadcast Channels Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">CELL BROADCAST SMS</span>
              <b className="text-white">Active (Geo-fenced)</b>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">WHATSAPP BOT</span>
              <b className="text-emerald-300">124k Subscribers</b>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
              <Volume2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">COMMUNITY SIRENS</span>
              <b className="text-white">48 Nodes Ready</b>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 shrink-0">
              <RadioTower className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">ALL INDIA RADIO (AIR)</span>
              <b className="text-purple-300">FM Multi-cast Live</b>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-eoc-card p-3.5 rounded-xl border border-eoc-border text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search alert title, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Warning Severities</option>
              <option value="RED">RED Alerts (Critical)</option>
              <option value="ORANGE">ORANGE Alerts (Severe)</option>
              <option value="YELLOW">YELLOW Alerts (Advisory)</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {filteredAlerts.map((alt) => {
            const isRed = alt.severity === 'RED';

            return (
              <div
                key={alt.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isRed
                    ? 'bg-red-950/20 border-red-800/80 shadow-lg shadow-red-950/30'
                    : 'bg-eoc-card border-eoc-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge level={alt.severity} size="md" pulse={isRed} />
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {alt.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Issued: {alt.issuedTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                      Delivered: {alt.broadcastDeliveredCount.toLocaleString()} Citizens
                    </span>
                    {alt.status === 'Active' && (
                      <button
                        onClick={() => acknowledgeAlert(alt.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{alt.title}</h3>
                  <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                    <p><b>Rationale:</b> {alt.reason}</p>
                    <p className="text-amber-300 font-semibold"><b>Mandated Directive:</b> {alt.recommendedAction}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-sky-400" />
                    <span>Jurisdiction: <b>{alt.affectedDistrict}, {alt.state}</b></span>
                  </div>
                  <div>
                    <span>Disseminated via: <b>{alt.capChannel.join(', ')}</b></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Generate CAP Modal */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-eoc-card border border-red-800/80 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden">
              <div className="bg-red-950/80 border-b border-red-800 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-red-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">
                    GENERATE COMMON ALERTING PROTOCOL (CAP) BULLETIN
                  </h3>
                </div>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAlert} className="p-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Alert Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-semibold"
                    >
                      <option value="RED">RED — Evacuation Directive</option>
                      <option value="ORANGE">ORANGE — Severe Warning</option>
                      <option value="YELLOW">YELLOW — Advisory Watch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">State Jurisdiction</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-semibold"
                    >
                      {NER_STATES.filter((s) => s !== 'All NER').map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Affected Districts & Highways</label>
                  <input
                    type="text"
                    value={formData.affectedDistrict}
                    onChange={(e) => setFormData({ ...formData, affectedDistrict: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Headline</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Geotechnical & Scientific Basis</label>
                  <textarea
                    rows={2}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mandated Public Directive</label>
                  <input
                    type="text"
                    value={formData.recommendedAction}
                    onChange={(e) => setFormData({ ...formData, recommendedAction: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center gap-1.5 shadow-lg shadow-red-950"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Transmit Broadcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
