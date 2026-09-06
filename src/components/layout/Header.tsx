'use client';

import React, { useState } from 'react';
import { useEOC } from '@/context/EOCContext';
import { useI18n } from '@/context/I18nContext';
import { NER_STATES } from '@/data/mockData';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Zap, 
  Radio, 
  Clock, 
  AlertTriangle, 
  Layers, 
  X, 
  CheckCircle2, 
  Send,
  Sparkles,
  Activity
} from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';
import { ConnectionIndicator } from '@/components/pwa/ConnectionIndicator';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const {
    systemTime,
    selectedState,
    setSelectedState,
    timeHorizon,
    setTimeHorizon,
    alerts,
    audioAlertsEnabled,
    toggleAudioAlerts,
    simulateCloudburst,
    isSimulating,
    createEmergencyAlert,
    eocStats
  } = useEOC();

  const { t, getLocalizedAlert } = useI18n();

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newAlertForm, setNewAlertForm] = useState({
    title: 'RED ALERT: Severe Landslide Threat & Road Cutoff',
    severity: 'RED' as const,
    riskLevel: 'CRITICAL' as const,
    state: (selectedState === 'All NER' ? 'Sikkim' : selectedState) as any,
    affectedDistrict: 'Pakyong & East Khasi Hills',
    affectedVillages: 'Singtam, 29th Mile, Mawkdok, Haflong Lower',
    reason: 'Heavy sustained precipitation (>160mm) triggering rapid loss of shear strength on vulnerable slopes.',
    validUntil: 'Next 24 Hours',
    recommendedAction: 'Immediate evacuation of riverside/slope dwellings. Close national highway lifelines.',
    issuedBy: 'ASDMA & GSI Joint Operations Node',
    capChannel: ['SMS', 'WhatsApp', 'Community Siren', 'Radio Broadcast'] as any,
  });

  const activeAlerts = alerts.filter(a => a.status === 'Active');

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmergencyAlert({
      ...newAlertForm,
      affectedVillages: newAlertForm.affectedVillages.split(',').map(s => s.trim()),
    });
    setShowAlertModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-eoc-surface/95 backdrop-blur-md border-b border-eoc-border text-eoc-text">
        {/* Top Emergency Ticker */}
        {activeAlerts.length > 0 && (
          <div className="bg-red-950/90 border-b border-red-800/80 px-4 py-1 flex items-center justify-between text-xs text-red-200 overflow-hidden">
            <div className="flex items-center gap-2 font-semibold shrink-0 text-red-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="tracking-wider uppercase font-mono text-[11px] bg-red-900/80 px-1.5 py-0.5 rounded border border-red-700">
                {t('header.capBroadcast')} ({activeAlerts.length})
              </span>
            </div>

            <div className="flex-1 mx-4 overflow-hidden whitespace-nowrap">
              <div className="inline-block animate-ticker">
                {activeAlerts.map((a, i) => {
                  const locAlert = getLocalizedAlert(a);
                  return (
                    <span key={a.id} className="mx-6 inline-flex items-center gap-2">
                      <span className="font-bold text-white">[{a.state} - {a.affectedDistrict}]:</span>
                      <span>{locAlert.title}</span>
                      <span className="text-red-400">({a.issuedTime})</span>
                      {i < activeAlerts.length - 1 && <span className="text-red-500">◆</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] font-mono text-red-300 shrink-0 hidden md:block">
              {t('common.defconActive')}
            </div>
          </div>
        )}

        {/* Main Header Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Branding & Status */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-base md:text-lg bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent font-mono">
                  {t('common.appName')}
                </span>
                <span className="text-[10px] uppercase font-mono bg-sky-950/80 text-sky-300 border border-sky-800/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <Activity className="h-3 w-3 text-sky-400 animate-pulse" />
                  {t('common.eocOperational')}
                </span>
              </div>
              <span className="text-[10px] text-eoc-muted hidden sm:block">
                {t('common.appSubtitle')}
              </span>
            </div>
          </div>

          {/* Center: Controls (State Filter & Horizon) */}
          <div className="flex items-center gap-2">
            {/* State Selector */}
            <div className="flex items-center bg-eoc-card border border-eoc-border rounded-md px-2 py-1">
              <span className="text-[11px] text-eoc-muted mr-1.5 hidden lg:inline font-mono">
                {t('common.region')}:
              </span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs text-sky-200 font-semibold focus:outline-none cursor-pointer"
              >
                {NER_STATES.map((st) => (
                  <option key={st} value={st} className="bg-eoc-card text-white">
                    {st === 'All NER' ? t('common.allStates') : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Horizon Forecast Selector */}
            <div className="hidden md:flex items-center bg-eoc-card border border-eoc-border rounded-md p-0.5 text-xs font-mono">
              {(['LIVE', '+24H', '+48H', '+72H'] as const).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setTimeHorizon(hz)}
                  className={`px-2 py-1 rounded text-[11px] transition-all font-semibold ${
                    timeHorizon === hz
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-eoc-muted hover:text-white'
                  }`}
                >
                  {hz === 'LIVE' ? t('common.live') : hz}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Actions & Indicators */}
          <div className="flex items-center gap-2">
            {/* Language Selector in Header */}
            <LanguageSelector />

            {/* Live Network & Offline PWA Status Indicator */}
            <ConnectionIndicator />

            {/* Simulate Cloudburst Surge Button */}
            <button
              onClick={() => simulateCloudburst('Pakyong')}
              disabled={isSimulating}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                isSimulating
                  ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Simulate severe cloudburst event in Sikkim to test early warning triggers"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {isSimulating ? t('header.simulating') : t('header.simulateCloudburst')}
              </span>
            </button>

            {/* Issue Broadcast Alert */}
            <button
              onClick={() => setShowAlertModal(true)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md shadow-red-950/50 transition-all border border-red-400/40 active:scale-95"
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden sm:inline">{t('header.issueCapAlert')}</span>
            </button>

            {/* Audio Sentry Toggle */}
            <button
              onClick={toggleAudioAlerts}
              className={`p-1.5 rounded-md border text-xs transition-all ${
                audioAlertsEnabled
                  ? 'bg-sky-950/60 text-sky-300 border-sky-800'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={audioAlertsEnabled ? t('header.sirenEnabled') : t('header.sirenMuted')}
            >
              {audioAlertsEnabled ? (
                <Volume2 className="h-4 w-4 text-sky-400" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-500" />
              )}
            </button>

            {/* Notifications Popover Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 rounded-md bg-eoc-card hover:bg-eoc-highlight border border-eoc-border text-eoc-muted hover:text-white transition-all"
              >
                <Bell className="h-4 w-4" />
                {activeAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-eoc-bg">
                    {activeAlerts.length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-eoc-card border border-eoc-border rounded-lg shadow-2xl z-50 overflow-hidden">
                  <div className="px-3 py-2 bg-eoc-surface border-b border-eoc-border flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      {t('header.activeWarnings')} ({activeAlerts.length})
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-eoc-muted hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-eoc-border">
                    {alerts.slice(0, 5).map((alt) => {
                      const locAlert = getLocalizedAlert(alt);
                      return (
                        <div key={alt.id} className="p-3 hover:bg-eoc-surface/60 transition-all">
                          <div className="flex items-center justify-between mb-1">
                            <SeverityBadge level={alt.severity} size="sm" pulse={alt.severity === 'RED'} />
                            <span className="text-[10px] text-eoc-muted font-mono">{alt.issuedTime}</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-100">{locAlert.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{locAlert.reason}</p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-sky-400 font-mono">
                            <span>{alt.state} • {alt.affectedDistrict}</span>
                            <span>{t('dashboard.deliveredCount', { count: alt.broadcastDeliveredCount.toLocaleString() })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Live Clock IST */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded text-xs font-mono text-sky-300">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span>{systemTime || t('common.liveIst')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Broadcast CAP Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eoc-card border border-red-800/80 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-950/80 border-b border-red-800 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-red-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {t('header.modalTitle')}
                  </h3>
                  <p className="text-[11px] text-red-300">
                    {t('header.modalSubtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-red-300 hover:text-white p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('header.alertSeverity')}</label>
                  <select
                    value={newAlertForm.severity}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, severity: e.target.value as any })}
                    className="w-full bg-eoc-surface border border-eoc-border rounded px-3 py-1.5 text-white font-semibold"
                  >
                    <option value="RED">RED — Extreme Threat (Evacuation Mandatory)</option>
                    <option value="ORANGE">ORANGE — Severe Warning (Prepare to Move)</option>
                    <option value="YELLOW">YELLOW — Watch / Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('header.stateJurisdiction')}</label>
                  <select
                    value={newAlertForm.state}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, state: e.target.value as any })}
                    className="w-full bg-eoc-surface border border-eoc-border rounded px-3 py-1.5 text-white font-semibold"
                  >
                    {NER_STATES.filter(s => s !== 'All NER').map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('header.affectedDistricts')}</label>
                <input
                  type="text"
                  value={newAlertForm.affectedDistrict}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, affectedDistrict: e.target.value })}
                  placeholder="e.g. Pakyong, East Khasi Hills, NH-10 Corridor"
                  className="w-full bg-eoc-surface border border-eoc-border rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('header.affectedVillages')}</label>
                <input
                  type="text"
                  value={newAlertForm.affectedVillages}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, affectedVillages: e.target.value })}
                  placeholder="e.g. Singtam Bazaar, 29th Mile, Mawkdok"
                  className="w-full bg-eoc-surface border border-eoc-border rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('header.bulletinHeadline')}</label>
                <input
                  type="text"
                  value={newAlertForm.title}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, title: e.target.value })}
                  className="w-full bg-eoc-surface border border-eoc-border rounded px-3 py-1.5 text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('header.rationale')}</label>
                <textarea
                  rows={2}
                  value={newAlertForm.reason}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, reason: e.target.value })}
                  className="w-full bg-eoc-surface border border-eoc-border rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('header.recommendedDirective')}</label>
                <input
                  type="text"
                  value={newAlertForm.recommendedAction}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, recommendedAction: e.target.value })}
                  className="w-full bg-eoc-surface border border-eoc-border rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-200">{t('header.multiChannel')}</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded flex items-center gap-1.5 shadow-lg shadow-red-950"
                >
                  <Send className="h-3.5 w-3.5" />
                  {t('header.transmitBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
