'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAlertEngine, AlertObject, AlertSeverity, RuleEvaluationInput } from '@/services/alerts';
import { useI18n } from '@/context/I18nContext';
import { 
  Radio, 
  Send, 
  CheckCircle2, 
  Smartphone, 
  Clock, 
  MapPin, 
  Search, 
  Plus, 
  ShieldAlert, 
  Sliders, 
  Play, 
  Users, 
  Flame, 
  Eye, 
  Check, 
  Zap, 
  Activity, 
  TrendingUp, 
  X 
} from 'lucide-react';
import { NER_STATES } from '@/data/mockData';

export default function AlertsPage() {
  const {
    alerts,
    activeAlerts,
    alertHistory,
    rules,
    metrics,
    acknowledgeAlert,
    escalateAlert,
    dispatchResponseTeam,
    resolveAlert,
    evaluateAndTriggerAlert,
    toggleRule,
    testEvaluation,
  } = useAlertEngine();

  const { t, getLocalizedSeverity, getLocalizedAlert } = useI18n();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY' | 'RULES'>('ACTIVE');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');

  // Selected Alert for Details Modal
  const [inspectAlert, setInspectAlert] = useState<AlertObject | null>(null);

  // New Alert Generation Modal
  const [showNewModal, setShowNewModal] = useState(false);

  // Interactive Rule Simulator Sandbox State
  const [simulatorState, setSimulatorState] = useState<RuleEvaluationInput>({
    district: 'Pakyong',
    state: 'Sikkim',
    location: 'NH-10 Singtam Corridor',
    latitude: 27.234,
    longitude: 88.489,
    riskScore: 84,
    rainfall24h: 135.0,
    rainfall7d: 260.0,
    soilMoisture: 88.0,
    slope: 36.0,
    elevation: 850,
    criticalSensorTriggered: true,
    historicalActivityCount: 7,
    verifiedFieldReportsCount: 2,
    populationExposed: 12000,
  });

  const [simulatorTriggering, setSimulatorTriggering] = useState(false);

  // Real-time evaluation output of the simulator
  const simResult = testEvaluation(simulatorState);

  // Identify highest priority critical alert for the Hero Banner
  const criticalHeroAlert = activeAlerts.find(
    (a) => a.severity === 'CRITICAL' && (a.status === 'ACTIVE' || a.status === 'ESCALATED')
  ) || activeAlerts.find((a) => a.severity === 'DANGER' && a.status === 'ACTIVE');

  // Filtered active alerts
  const filteredActiveAlerts = activeAlerts.filter((alt) => {
    const matchesSearch =
      alt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || alt.severity === severityFilter;
    const matchesState = stateFilter === 'ALL' || alt.state === stateFilter;
    return matchesSearch && matchesSev && matchesState;
  });

  // Filtered history alerts
  const filteredHistoryAlerts = alertHistory.filter((alt) => {
    const matchesSearch =
      alt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alt.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || alt.severity === severityFilter;
    return matchesSearch && matchesSev;
  });

  const getSeverityBadgeClass = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-300 border-red-700 animate-pulse';
      case 'DANGER':
        return 'bg-orange-950 text-orange-300 border-orange-700';
      case 'WARNING':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'WATCH':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      case 'INFO':
      default:
        return 'bg-sky-950 text-sky-300 border-sky-800';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-900/60 text-red-200 border-red-700';
      case 'ACKNOWLEDGED':
        return 'bg-blue-900/60 text-blue-200 border-blue-700';
      case 'ESCALATED':
        return 'bg-purple-900/60 text-purple-200 border-purple-700';
      case 'DISPATCHED':
        return 'bg-emerald-900/60 text-emerald-200 border-emerald-700';
      case 'RESOLVED':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleApplyPreset = (preset: 'CRITICAL_CLOUDBURST' | 'DANGER_MUD' | 'WARNING_RAIN' | 'NORMAL') => {
    switch (preset) {
      case 'CRITICAL_CLOUDBURST':
        setSimulatorState({
          district: 'Pakyong',
          state: 'Sikkim',
          location: 'Singtam 29th Mile NH-10',
          latitude: 27.234,
          longitude: 88.489,
          riskScore: 92,
          rainfall24h: 168.0,
          rainfall7d: 310.0,
          soilMoisture: 93.0,
          slope: 41.0,
          elevation: 790,
          criticalSensorTriggered: true,
          historicalActivityCount: 8,
          verifiedFieldReportsCount: 2,
          populationExposed: 14500,
        });
        break;
      case 'DANGER_MUD':
        setSimulatorState({
          district: 'East Khasi Hills',
          state: 'Meghalaya',
          location: 'Mawkdok Gorge SH-5',
          latitude: 25.352,
          longitude: 91.734,
          riskScore: 76,
          rainfall24h: 130.0,
          rainfall7d: 270.0,
          soilMoisture: 87.5,
          slope: 38.0,
          elevation: 1220,
          criticalSensorTriggered: false,
          historicalActivityCount: 5,
          verifiedFieldReportsCount: 1,
          populationExposed: 8200,
        });
        break;
      case 'WARNING_RAIN':
        setSimulatorState({
          district: 'Dima Hasao',
          state: 'Assam',
          location: 'Jatinga Hill Section NH-27',
          latitude: 25.123,
          longitude: 92.981,
          riskScore: 64,
          rainfall24h: 110.0,
          rainfall7d: 220.0,
          soilMoisture: 82.0,
          slope: 32.0,
          elevation: 620,
          criticalSensorTriggered: false,
          historicalActivityCount: 4,
          verifiedFieldReportsCount: 0,
          populationExposed: 4500,
        });
        break;
      case 'NORMAL':
      default:
        setSimulatorState({
          district: 'Papum Pare',
          state: 'Arunachal Pradesh',
          location: 'Itanagar Hills Axis',
          latitude: 27.084,
          longitude: 93.605,
          riskScore: 35,
          rainfall24h: 22.0,
          rainfall7d: 55.0,
          soilMoisture: 42.0,
          slope: 20.0,
          elevation: 750,
          criticalSensorTriggered: false,
          historicalActivityCount: 1,
          verifiedFieldReportsCount: 0,
          populationExposed: 3200,
        });
        break;
    }
  };

  const handleTriggerSimulatedBroadcast = () => {
    setSimulatorTriggering(true);
    setTimeout(() => {
      evaluateAndTriggerAlert(simulatorState);
      setSimulatorTriggering(false);
      setActiveTab('ACTIVE');
    }, 600);
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header Bar */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
                <span>{t('alerts.title')}</span>
                <span className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded-full border border-red-700 uppercase">
                  Multi-Channel Active
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {t('alerts.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('RULES')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Sliders className="h-3.5 w-3.5 text-purple-400" />
              <span>{t('alerts.alertRuleSimulatorTitle')}</span>
            </button>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-950 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>{t('header.issueCapAlert')}</span>
            </button>
          </div>
        </div>

        {/* Operational Multi-Channel Channels Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800 shrink-0">
              <Activity className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">{t('kpi.activeAlerts')}</span>
              <b className="text-white text-sm">{metrics.totalActive} {t('common.active')}</b>
              <span className="text-[10px] text-red-400 block font-mono">({metrics.criticalCount} Critical / {metrics.dangerCount} Danger)</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">{t('alerts.deliveryChannels.sms')}</span>
              <b className="text-white">Active (Geo-Fenced)</b>
              <span className="text-[10px] text-sky-400 block font-mono">Twilio / CDAC CAP Ready</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800 shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">{t('alerts.deliveryChannels.push')}</span>
              <b className="text-purple-300">Live High-Priority</b>
              <span className="text-[10px] text-slate-400 block font-mono">{metrics.totalRecipientsReached.toLocaleString()} Reached</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-mono">{t('emergency.colResponseTeam')}</span>
              <b className="text-emerald-300">{metrics.dispatchedCount} {t('common.dispatched')}</b>
              <span className="text-[10px] text-slate-400 block font-mono">NDRF / SDRF Units Active</span>
            </div>
          </div>
        </div>

        {/* CRITICAL ALERT HERO UX BANNER */}
        {criticalHeroAlert && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-5 border-2 border-red-600 shadow-2xl shadow-red-950/80 animate-in fade-in duration-300">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-44 h-44 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            
            {(() => {
              const locHero = getLocalizedAlert(criticalHeroAlert);
              return (
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-600 text-white font-mono font-black text-xs uppercase tracking-wider animate-pulse shadow-md shadow-red-900">
                        <Flame className="h-3.5 w-3.5" />
                        <span>{t('risk.levels.CRITICAL')} {t('risk.levels.WARNING')}</span>
                      </span>
                      <span className="text-xs text-red-300 font-mono flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{criticalHeroAlert.createdAt}</span>
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-bold border ${getStatusBadgeClass(criticalHeroAlert.status)}`}>
                        {criticalHeroAlert.status}
                      </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-black text-white tracking-wide">
                      {locHero.title}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="bg-black/40 p-2.5 rounded-lg border border-red-900/60">
                        <span className="text-[10px] text-red-300 font-mono block">{t('incidents.colLocation')}</span>
                        <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span>{criticalHeroAlert.location} ({criticalHeroAlert.district}, {criticalHeroAlert.state})</span>
                        </span>
                      </div>

                      <div className="bg-black/40 p-2.5 rounded-lg border border-red-900/60">
                        <span className="text-[10px] text-red-300 font-mono block">TRIGGER REASON</span>
                        <p className="text-slate-200 line-clamp-2 mt-0.5 text-[11px]">
                          {locHero.reason}
                        </p>
                      </div>

                      <div className="bg-black/40 p-2.5 rounded-lg border border-red-900/60">
                        <span className="text-[10px] text-red-300 font-mono block">{t('emergency.colPopulation')}</span>
                        <span className="text-white font-bold flex items-center gap-1 mt-0.5 text-sm">
                          <Users className="h-4 w-4 text-amber-400" />
                          <span>{criticalHeroAlert.affectedPopulation.toLocaleString()} Residents</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-800 text-xs">
                      <span className="text-[10px] text-red-300 font-mono font-bold block uppercase">{t('drawer.recommendedDirectives')}:</span>
                      <p className="text-red-100 font-medium mt-0.5">
                        {locHero.recommendedAction}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 shrink-0 self-stretch lg:self-auto justify-end">
                    <button
                      onClick={() => acknowledgeAlert(criticalHeroAlert.id)}
                      disabled={criticalHeroAlert.status === 'ACKNOWLEDGED' || criticalHeroAlert.status === 'DISPATCHED'}
                      className="flex-1 lg:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-950 transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t('alerts.acknowledge')}</span>
                    </button>

                    <button
                      onClick={() => escalateAlert(criticalHeroAlert.id)}
                      disabled={criticalHeroAlert.status === 'ESCALATED'}
                      className="flex-1 lg:flex-none px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-purple-950 transition-all"
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>{t('alerts.escalate')}</span>
                    </button>

                    <button
                      onClick={() => dispatchResponseTeam(criticalHeroAlert.id)}
                      disabled={criticalHeroAlert.status === 'DISPATCHED'}
                      className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-all"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      <span>{t('emergency.dispatch')}</span>
                    </button>

                    <button
                      onClick={() => setInspectAlert(criticalHeroAlert)}
                      className="flex-1 lg:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{t('common.details')}</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex border-b border-eoc-border text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'ACTIVE'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>{t('alerts.activeAlertsTab', { count: activeAlerts.length })}</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'HISTORY'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{t('alerts.alertHistoryTab', { count: alertHistory.length })}</span>
          </button>

          <button
            onClick={() => setActiveTab('RULES')}
            className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'RULES'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>{t('alerts.alertRulesTab', { count: rules.length })}</span>
          </button>
        </div>

        {/* TAB 1: ACTIVE ALERTS */}
        {activeTab === 'ACTIVE' && (
          <div className="space-y-4">
            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-eoc-card p-3.5 rounded-xl border border-eoc-border text-xs">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('incidents.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">{t('common.all')} {t('incidents.colSeverity')}</option>
                  <option value="CRITICAL">{t('risk.levels.CRITICAL')}</option>
                  <option value="DANGER">{t('risk.levels.DANGER')}</option>
                  <option value="WARNING">{t('risk.levels.WARNING')}</option>
                  <option value="WATCH">{t('risk.levels.WATCH')}</option>
                  <option value="INFO">INFO</option>
                </select>

                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">{t('common.allStates')}</option>
                  {NER_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Alerts Grid */}
            <div className="grid grid-cols-1 gap-3.5">
              {filteredActiveAlerts.length === 0 ? (
                <div className="bg-eoc-card p-8 rounded-xl border border-eoc-border text-center text-slate-400">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-200">{t('incidents.noIncidents')}</p>
                </div>
              ) : (
                filteredActiveAlerts.map((alert) => {
                  const loc = getLocalizedAlert(alert);
                  return (
                    <div
                      key={alert.id}
                      className="bg-eoc-card hover:bg-slate-900/60 p-4 rounded-xl border border-eoc-border transition-all space-y-3"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-black border ${getSeverityBadgeClass(alert.severity)}`}>
                            {getLocalizedSeverity(alert.severity)}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getStatusBadgeClass(alert.status)}`}>
                            {alert.status}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {alert.id}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {alert.createdAt}
                          </span>
                        </div>

                        {/* Multi-Channel Delivery Indicators */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          <span className="text-slate-400 text-[10px]">Delivered Via:</span>
                          {alert.deliveryLog.map((log) => (
                            <span
                              key={log.channel}
                              title={`${log.providerName}: ${log.recipientCount} recipients (${log.latencyMs}ms)`}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]"
                            >
                              {log.channel === 'APP' && <Activity className="h-2.5 w-2.5 text-red-400" />}
                              {log.channel === 'SMS' && <Smartphone className="h-2.5 w-2.5 text-sky-400" />}
                              {log.channel === 'PUSH' && <Zap className="h-2.5 w-2.5 text-purple-400" />}
                              <span>{log.channel}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span>{loc.title}</span>
                        </h3>
                        <p className="text-xs text-slate-300 mt-1">
                          <b className="text-slate-400">Trigger:</b> {loc.reason}
                        </p>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{t('drawer.recommendedDirectives')}:</span>
                          <p className="text-slate-200 text-xs font-medium">{loc.recommendedAction}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                          <span className="text-[10px] text-slate-400 font-mono">
                            Pop: <b className="text-white">{alert.affectedPopulation.toLocaleString()}</b>
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                        <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-400 font-mono">
                          <span>Rules:</span>
                          {alert.triggerRules.map((rule, idx) => (
                            <span key={idx} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                              {rule.split(' ')[0]}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {alert.status === 'ACTIVE' && (
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs font-bold rounded-lg border border-blue-700 flex items-center gap-1 transition-all"
                            >
                              <Check className="h-3 w-3" />
                              <span>{t('alerts.acknowledge')}</span>
                            </button>
                          )}

                          {alert.status !== 'DISPATCHED' && (
                            <button
                              onClick={() => dispatchResponseTeam(alert.id)}
                              className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 text-xs font-bold rounded-lg border border-emerald-700 flex items-center gap-1 transition-all"
                            >
                              <ShieldAlert className="h-3 w-3" />
                              <span>{t('emergency.dispatch')}</span>
                            </button>
                          )}

                          <button
                            onClick={() => setInspectAlert(alert)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                          >
                            <Eye className="h-3 w-3" />
                            <span>{t('common.details')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALERT HISTORY */}
        {activeTab === 'HISTORY' && (
          <div className="space-y-4">
            <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  {t('alerts.alertHistoryTab', { count: filteredHistoryAlerts.length })}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] bg-slate-900/60">
                      <th className="p-2.5">{t('incidents.colId')}</th>
                      <th className="p-2.5">{t('incidents.colSeverity')}</th>
                      <th className="p-2.5">{t('incidents.colLocation')}</th>
                      <th className="p-2.5">{t('incidents.colTime')}</th>
                      <th className="p-2.5">Recipients</th>
                      <th className="p-2.5">{t('incidents.colStatus')}</th>
                      <th className="p-2.5 text-right">{t('incidents.colActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredHistoryAlerts.map((alt) => {
                      const loc = getLocalizedAlert(alt);
                      return (
                        <tr key={alt.id} className="hover:bg-slate-900/40">
                          <td className="p-2.5 font-mono font-bold text-white">{alt.id}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold border ${getSeverityBadgeClass(alt.severity)}`}>
                              {getLocalizedSeverity(alt.severity)}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-200">
                            <div><b>{alt.district}</b>, {alt.state}</div>
                            <div className="text-[11px] text-slate-400">{loc.title}</div>
                          </td>
                          <td className="p-2.5 text-slate-300 font-mono text-[11px]">{alt.createdAt}</td>
                          <td className="p-2.5 text-slate-200 font-mono">
                            {alt.deliveryLog.reduce((s, l) => s + l.recipientCount, 0).toLocaleString()}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getStatusBadgeClass(alt.status)}`}>
                              {alt.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => setInspectAlert(alt)}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded border border-slate-700"
                            >
                              {t('common.details')}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALERT RULES & LIVE SIMULATOR SANDBOX */}
        {activeTab === 'RULES' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Side: Rule Definitions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-purple-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {t('alerts.alertRulesTab', { count: rules.length })}
                    </h3>
                  </div>
                  <span className="text-[11px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 font-mono">
                    Online
                  </span>
                </div>

                <div className="space-y-2.5 pt-1">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">{rule.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${getSeverityBadgeClass(rule.severityTarget)}`}>
                            Target: {getLocalizedSeverity(rule.severityTarget)}
                          </span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={(e) => toggleRule(rule.id, e.target.checked)}
                            className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-0"
                          />
                          <span className="text-[11px] text-slate-400 font-mono">
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>

                      <div className="font-mono text-[11px] text-sky-400 bg-black/40 px-2 py-1 rounded border border-slate-800">
                        <code>IF {rule.conditionDescription} THEN {rule.severityTarget}</code>
                      </div>

                      <p className="text-[11px] text-slate-300">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Interactive Rule Simulator Sandbox */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-eoc-card p-4 rounded-xl border border-purple-900/60 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-emerald-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      {t('alerts.alertRuleSimulatorTitle')}
                    </h3>
                  </div>
                </div>

                {/* Preset Scenario Selectors */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">QUICK PRESET SCENARIOS:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleApplyPreset('CRITICAL_CLOUDBURST')}
                      className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 text-[11px] font-bold rounded border border-red-800 text-left transition-all"
                    >
                      🔴 {t('header.simulateCloudburst')}
                    </button>
                    <button
                      onClick={() => handleApplyPreset('DANGER_MUD')}
                      className="p-1.5 bg-orange-950/60 hover:bg-orange-900/80 text-orange-200 text-[11px] font-bold rounded border border-orange-800 text-left transition-all"
                    >
                      🟠 Mudflow in Sohra
                    </button>
                    <button
                      onClick={() => handleApplyPreset('WARNING_RAIN')}
                      className="p-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 text-[11px] font-bold rounded border border-amber-800 text-left transition-all"
                    >
                      🟡 Heavy Rain in Haflong
                    </button>
                    <button
                      onClick={() => handleApplyPreset('NORMAL')}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded border border-slate-700 text-left transition-all"
                    >
                      🟢 Normal Conditions
                    </button>
                  </div>
                </div>

                {/* Interactive Sliders */}
                <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-slate-400">{t('drawer.riskScore')}:</span>
                      <b className="text-white">{simulatorState.riskScore} / 100</b>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={simulatorState.riskScore}
                      onChange={(e) =>
                        setSimulatorState((prev) => ({ ...prev, riskScore: Number(e.target.value) }))
                      }
                      className="w-full accent-purple-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-slate-400">{t('drawer.rainfall24h')}:</span>
                      <b className="text-sky-300">{simulatorState.rainfall24h} mm</b>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="250"
                      step="5"
                      value={simulatorState.rainfall24h}
                      onChange={(e) =>
                        setSimulatorState((prev) => ({ ...prev, rainfall24h: Number(e.target.value) }))
                      }
                      className="w-full accent-sky-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-slate-400">{t('drawer.soilMoisture')}:</span>
                      <b className="text-emerald-300">{simulatorState.soilMoisture} %</b>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={simulatorState.soilMoisture}
                      onChange={(e) =>
                        setSimulatorState((prev) => ({ ...prev, soilMoisture: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-slate-400">{t('drawer.slopeAngle')}:</span>
                      <b className="text-amber-300">{simulatorState.slope}°</b>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={simulatorState.slope}
                      onChange={(e) =>
                        setSimulatorState((prev) => ({ ...prev, slope: Number(e.target.value) }))
                      }
                      className="w-full accent-amber-500"
                    />
                  </div>
                </div>

                {/* Real-time Evaluated Result */}
                <div className="bg-black/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Calculated Alert Tier:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black border ${getSeverityBadgeClass(simResult.severity)}`}>
                      {getLocalizedSeverity(simResult.severity)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{simResult.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-1">{simResult.reason}</p>
                  </div>

                  <button
                    onClick={handleTriggerSimulatedBroadcast}
                    disabled={simulatorTriggering}
                    className="w-full mt-2 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-red-950 transition-all"
                  >
                    <Radio className="h-4 w-4" />
                    <span>{simulatorTriggering ? 'Transmitting...' : t('alerts.testRules')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DETAILS INSPECTION MODAL */}
        {inspectAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-eoc-card max-w-2xl w-full rounded-2xl border border-eoc-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black border ${getSeverityBadgeClass(inspectAlert.severity)}`}>
                    {getLocalizedSeverity(inspectAlert.severity)}
                  </span>
                  <h3 className="font-bold text-white text-sm">{inspectAlert.id}</h3>
                </div>
                <button
                  onClick={() => setInspectAlert(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto text-xs">
                <div>
                  <h4 className="text-sm font-bold text-white">{inspectAlert.title}</h4>
                  <p className="text-xs text-slate-300 mt-1">{inspectAlert.message}</p>
                </div>

                <div className="bg-red-950/40 p-3 rounded-xl border border-red-900 space-y-1">
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold">{t('drawer.recommendedDirectives')}:</span>
                  <p className="text-slate-200 text-xs">{inspectAlert.recommendedAction}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    acknowledgeAlert(inspectAlert.id);
                    setInspectAlert(null);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                >
                  {t('alerts.acknowledge')}
                </button>
                <button
                  onClick={() => {
                    dispatchResponseTeam(inspectAlert.id);
                    setInspectAlert(null);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                >
                  {t('emergency.dispatch')}
                </button>
                <button
                  onClick={() => {
                    resolveAlert(inspectAlert.id);
                    setInspectAlert(null);
                  }}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg text-xs"
                >
                  {t('alerts.resolve')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEW MANUAL ALERT MODAL */}
        {showNewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-eoc-card max-w-lg w-full rounded-2xl border border-eoc-border shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4 text-red-400" />
                  <span>{t('header.modalTitle')}</span>
                </h3>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    handleApplyPreset('CRITICAL_CLOUDBURST');
                    handleTriggerSimulatedBroadcast();
                    setShowNewModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{t('header.transmitBtn')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
