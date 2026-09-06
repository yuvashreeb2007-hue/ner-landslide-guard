'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  useEmergencyResponse,
  PrioritizedIncident,
  PriorityTier,
} from '@/services/emergency';
import { useI18n } from '@/context/I18nContext';
import { 
  LifeBuoy, 
  Users, 
  Shield, 
  Send,
  Building2,
  ShieldAlert, 
  Flame, 
  Activity, 
  GitFork, 
  ChevronRight, 
  Compass,
  AlertTriangle,
  Clock,
  X
} from 'lucide-react';
import { NER_STATES } from '@/data/mockData';

export default function EmergencyPage() {
  const {
    incidents,
    responseTeams,
    reliefCamps,
    metrics,
    dispatchTeam,
    recallTeam,
    getRelationshipChain,
  } = useEmergencyResponse();

  const { t, getLocalizedPriority } = useI18n();

  // Selected incident for Chain Inspection (Defaults to top P1 incident)
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(
    incidents[0]?.id || 'INC-2026-SK-01'
  );

  // Dispatch Modal State
  const [dispatchModalIncident, setDispatchModalIncident] = useState<PrioritizedIncident | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(responseTeams[0]?.id || '');

  // Filter States
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Currently selected chain
  const relationshipChain = getRelationshipChain(selectedIncidentId);

  // Filtered list
  const filteredIncidents = incidents.filter((inc) => {
    const matchesPriority = priorityFilter === 'ALL' || inc.priority.tier === priorityFilter;
    const matchesState = stateFilter === 'ALL' || inc.state === stateFilter;
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.roadName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesState && matchesSearch;
  });

  const getPriorityBadgeClass = (tier: PriorityTier) => {
    switch (tier) {
      case 'P1':
        return 'bg-red-950 text-red-300 border-red-700 animate-pulse';
      case 'P2':
        return 'bg-orange-950 text-orange-300 border-orange-700';
      case 'P3':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'P4':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getRoadStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completely Blocked':
        return 'bg-red-900/80 text-red-200 border-red-700 font-bold';
      case 'High Risk Warning':
        return 'bg-orange-900/80 text-orange-200 border-orange-700 font-bold';
      case 'Partial Lane Open':
        return 'bg-amber-900/80 text-amber-200 border-amber-700';
      case 'Under Clearance':
        return 'bg-blue-900/80 text-blue-200 border-blue-700';
      case 'Clear':
      default:
        return 'bg-emerald-900/80 text-emerald-200 border-emerald-700';
    }
  };

  const handleOpenDispatch = (incident: PrioritizedIncident) => {
    setDispatchModalIncident(incident);
    const matchStateTeam = responseTeams.find(
      (t) => t.state === incident.state && t.status === 'Standing By'
    );
    setSelectedTeamId(matchStateTeam?.id || responseTeams[0]?.id || '');
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatchModalIncident && selectedTeamId) {
      dispatchTeam(dispatchModalIncident.id, selectedTeamId);
      setDispatchModalIncident(null);
    }
  };

  return (
    <MainLayout>
      <ProtectedRoute 
        requiredRoles={['ADMIN', 'DISTRICT_OFFICER']} 
        moduleName="Emergency Response Prioritization & Tactical Dispatch"
      >
        <div className="space-y-5">
          {/* Header */}
          <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide flex items-center gap-2">
                <span>{t('emergency.title')}</span>
                <span className="text-[10px] bg-red-900/80 text-red-200 px-2 py-0.5 rounded-full border border-red-700 uppercase">
                  {t('emergency.icsActive')}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                {t('emergency.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-emerald-400 font-bold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>{t('emergency.battalionsDeployed', { dispatched: metrics.dispatchedCount, total: metrics.totalTeams })}</span>
            </span>
          </div>
        </div>

        {/* Operational Response KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-red-900/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800 shrink-0">
              <Flame className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{t('emergency.p1Immediate')}</span>
              <b className="text-red-400 text-sm">{metrics.p1Count} {t('common.critical')}</b>
              <span className="text-[10px] text-slate-400 block">&lt;30m Window</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-orange-900/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-950 text-orange-400 border border-orange-800 shrink-0">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{t('emergency.p2Urgent')}</span>
              <b className="text-orange-300 text-sm">{metrics.p2Count} {t('common.high')}</b>
              <span className="text-[10px] text-slate-400 block">&lt;60m Deploy</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-900/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{t('emergency.p3High')} / {t('emergency.p4Monitor')}</span>
              <b className="text-amber-300 text-sm">{metrics.p3Count + metrics.p4Count}</b>
              <span className="text-[10px] text-slate-400 block">{t('common.active')}</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-sky-900/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">AVG {t('emergency.colEta')}</span>
              <b className="text-sky-300 text-sm">{metrics.avgEtaMinutes} Min</b>
              <span className="text-[10px] text-slate-400 block">Terrain-Adjusted</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-900/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">{t('emergency.colPopulation')}</span>
              <b className="text-emerald-300 text-sm">{metrics.totalPopProtected.toLocaleString()}</b>
              <span className="text-[10px] text-slate-400 block">8 NER States</span>
            </div>
          </div>
        </div>

        {/* SYSTEMIC RELATIONSHIP CHAIN VISUALIZER: Incident -> Road -> Village -> Population -> Response Team */}
        {relationshipChain && (
          <div className="bg-eoc-card p-4 rounded-xl border border-purple-900/60 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {t('emergency.relationshipChainTitle')} ({t('emergency.stepIncident')} ➔ {t('emergency.stepRoad')} ➔ {t('emergency.stepVillage')} ➔ {t('emergency.stepPopulation')} ➔ {t('emergency.stepResponseTeam')})
                </h3>
              </div>
              <span className="text-[10px] text-purple-300 font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                Focal: {relationshipChain.incident.id}
              </span>
            </div>

            {/* Visual 5-Node Chain */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs font-mono">
              {/* Node 1: Incident */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-red-800/80 space-y-1 relative">
                <div className="text-[10px] text-red-400 font-bold flex items-center justify-between">
                  <span>{t('emergency.stepIncident').toUpperCase()}</span>
                  <span className={`px-1.5 py-0.2 rounded font-black text-[9px] border ${getPriorityBadgeClass(relationshipChain.incident.priorityTier)}`}>
                    {relationshipChain.incident.priorityTier} ({relationshipChain.incident.priorityScore})
                  </span>
                </div>
                <h4 className="text-white font-bold font-sans text-xs line-clamp-1">{relationshipChain.incident.name}</h4>
                <div className="text-slate-400 text-[11px]">{relationshipChain.incident.type}</div>
                <div className="text-red-300 text-[10px]">{relationshipChain.incident.coordinates}</div>
                <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 text-slate-500">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
              </div>

              {/* Node 2: Road */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-amber-800/80 space-y-1 relative">
                <div className="text-[10px] text-amber-400 font-bold flex items-center justify-between">
                  <span>{t('emergency.stepRoad').toUpperCase()}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] border ${getRoadStatusBadgeClass(relationshipChain.road.status)}`}>
                    {relationshipChain.road.status}
                  </span>
                </div>
                <h4 className="text-white font-bold font-sans text-xs line-clamp-1">{relationshipChain.road.name}</h4>
                <div className="text-slate-300 text-[11px]">{relationshipChain.road.route}</div>
                <div className="text-amber-300 text-[10px]">{relationshipChain.road.impactDescription}</div>
                <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 text-slate-500">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
              </div>

              {/* Node 3: Village */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-sky-800/80 space-y-1 relative">
                <div className="text-[10px] text-sky-400 font-bold flex items-center justify-between">
                  <span>{t('emergency.stepVillage').toUpperCase()}</span>
                  <span className="text-sky-300 text-[10px] bg-sky-950 px-1.5 py-0.2 rounded border border-sky-800">
                    {relationshipChain.village.count} Cut Off
                  </span>
                </div>
                <h4 className="text-white font-bold font-sans text-xs line-clamp-1">{relationshipChain.village.primaryVillage}</h4>
                <div className="text-slate-400 text-[11px] line-clamp-1">{relationshipChain.village.allVillages.join(', ')}</div>
                <div className="text-sky-300 text-[10px] line-clamp-1">Relief: {relationshipChain.village.evacuationCenter}</div>
                <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 text-slate-500">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
              </div>

              {/* Node 4: Population */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-800/80 space-y-1 relative">
                <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-between">
                  <span>{t('emergency.stepPopulation').toUpperCase()}</span>
                  <span className="text-emerald-300 text-[10px] font-bold">
                    {relationshipChain.population.totalExposed.toLocaleString()} Total
                  </span>
                </div>
                <h4 className="text-white font-bold font-sans text-xs">{relationshipChain.population.highRiskCount.toLocaleString()} In Danger Zone</h4>
                <div className="text-slate-400 text-[11px]">{relationshipChain.population.evacuatedCount.toLocaleString()} Evacuated</div>
                <div className="text-emerald-300 text-[10px]">Rations: Adequate</div>
                <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 z-10 text-slate-500">
                  <ChevronRight className="h-4 w-4 text-purple-400" />
                </div>
              </div>

              {/* Node 5: Response Team */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-blue-800/80 space-y-1">
                <div className="text-[10px] text-blue-400 font-bold flex items-center justify-between">
                  <span>{t('emergency.stepResponseTeam').toUpperCase()}</span>
                  <span className="text-sky-300 text-[10px] bg-blue-950 px-1.5 py-0.2 rounded border border-blue-800">
                    ETA: {relationshipChain.responseTeam.etaMinutes}m
                  </span>
                </div>
                <h4 className="text-white font-bold font-sans text-xs line-clamp-1">{relationshipChain.responseTeam.teamName}</h4>
                <div className="text-slate-400 text-[11px]">{relationshipChain.responseTeam.personnelCount} Rescuers</div>
                <div className="text-blue-300 text-[10px]">Base: {relationshipChain.responseTeam.baseLocation}</div>
              </div>
            </div>
          </div>
        )}

        {/* PRIORITY INCIDENT TRIAGE QUEUE (Ranked P1 -> P4) */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-eoc-border pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <span>{t('emergency.title')}</span>
                <span className="text-slate-400 font-normal">({filteredIncidents.length} Ranked)</span>
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                {t('emergency.subtitle')}
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative min-w-[180px]">
                <input
                  type="text"
                  placeholder={t('incidents.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">{t('common.all')} {t('emergency.colPriority')}</option>
                <option value="P1">{t('emergency.p1Immediate')}</option>
                <option value="P2">{t('emergency.p2Urgent')}</option>
                <option value="P3">{t('emergency.p3High')}</option>
                <option value="P4">{t('emergency.p4Monitor')}</option>
              </select>

              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">{t('common.allStates')}</option>
                {NER_STATES.filter(s => s !== 'All NER').map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Incident Triage List */}
          <div className="space-y-3">
            {filteredIncidents.map((inc) => {
              const isSelected = selectedIncidentId === inc.id;
              const isDispatched = inc.status === 'Response Dispatched';

              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-slate-900/95 border-purple-600 ring-1 ring-purple-500 shadow-xl'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black border ${getPriorityBadgeClass(inc.priority.tier)}`}>
                        {getLocalizedPriority(inc.priority.tier)} ({inc.priority.score}/100)
                      </span>
                      <span className="font-mono text-xs font-bold text-sky-400">{inc.id}</span>
                      <span className="font-bold text-white text-sm">{inc.title}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({inc.district}, {inc.state})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded border ${getRoadStatusBadgeClass(inc.roadStatus)}`}>
                        {inc.roadName} ({inc.roadStatus})
                      </span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                        {inc.reportedTime}
                      </span>
                    </div>
                  </div>

                  {/* Operational Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px] font-mono bg-black/40 p-2.5 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">{t('emergency.colRisk')}</span>
                      <b className="text-purple-300">{inc.riskScore} / 100</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">{t('emergency.colPopulation')}</span>
                      <b className="text-amber-300">{inc.affectedPopulation.toLocaleString()}</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">{t('emergency.stepVillage')}</span>
                      <b className="text-sky-300">{inc.affectedVillages.length}</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">{t('drawer.rainfall24h')}</span>
                      <b className="text-blue-300">{inc.rainfall24hMm.toFixed(1)} mm</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">{t('emergency.colResponseTeam')}</span>
                      <b className="text-emerald-300 line-clamp-1">{inc.assignedTeamName || t('common.pending')}</b>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">{t('emergency.colEta')}</span>
                      <b className="text-sky-400 font-bold">{inc.estimatedEtaMinutes} Min</b>
                    </div>
                  </div>

                  {/* SOP & Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs pt-1">
                    <div className="space-y-0.5 flex-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">
                        {t('drawer.recommendedDirectives')}:
                      </span>
                      <p className="text-slate-200 text-xs font-medium">{inc.recommendedAction}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncidentId(inc.id);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1"
                      >
                        <Compass className="h-3 w-3 text-purple-400" />
                        <span>{t('emergency.relationshipChainTitle')}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDispatch(inc);
                        }}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-all ${
                          isDispatched
                            ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950'
                        }`}
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>{isDispatched ? t('emergency.dispatched') : t('emergency.dispatch')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SPECIALIZED MOUNTAIN RESCUE BATTALIONS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-400" />
              <span>{t('emergency.colResponseTeam')} ({responseTeams.length} Battalions)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">NDRF, SDRF & Border Roads Organisation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {responseTeams.map((team) => {
              const isDeployed = team.status === 'Deployed';

              return (
                <div
                  key={team.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isDeployed
                      ? 'bg-blue-950/40 border-blue-700 shadow-md shadow-blue-950/40 ring-1 ring-blue-600'
                      : 'bg-eoc-card border-eoc-border'
                  }`}
                >
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                        {team.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          isDeployed
                            ? 'bg-blue-900 text-blue-200 border-blue-700 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {team.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-xs">{team.name}</h4>
                      <div className="text-[11px] text-slate-400 font-mono">{team.unit}</div>
                    </div>

                    <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Personnel:</span>
                        <b className="text-white">{team.personnelCount} Mountain Rescuers</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Base Post:</span>
                        <span className="text-slate-300 line-clamp-1">{team.baseLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Specialization:</span>
                        <span className="text-purple-300">{team.specialization}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Equipment:</span>
                      <div className="flex flex-wrap gap-1">
                        {team.equipment.slice(0, 3).map((eq, eIdx) => (
                          <span
                            key={eIdx}
                            className="bg-slate-900 text-slate-300 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Officer: {team.contactOfficer}</span>
                    {isDeployed && (
                      <button
                        onClick={() => recallTeam(team.id)}
                        className="text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        {t('emergency.recall')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DESIGNATED DISTRICT RELIEF CAMPS */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                DESIGNATED DISTRICT RELIEF CAMPS & EVACUATION HUBS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">SDMA & DDMA Designated Evacuation Centers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Relief Hub Name</th>
                  <th className="p-2.5">District / State</th>
                  <th className="p-2.5">Capacity</th>
                  <th className="p-2.5">Current Occupancy</th>
                  <th className="p-2.5">Medical Unit</th>
                  <th className="p-2.5">Food & Water Status</th>
                  <th className="p-2.5">Duty Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {reliefCamps.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white font-sans">{camp.name}</td>
                    <td className="p-2.5 text-slate-400">{camp.district}, {camp.state}</td>
                    <td className="p-2.5 text-slate-300">{camp.capacity.toLocaleString()} Pax</td>
                    <td className="p-2.5 font-bold text-sky-300">
                      {camp.currentOccupancy.toLocaleString()} ({Math.round((camp.currentOccupancy / camp.capacity) * 100)}%)
                    </td>
                    <td className="p-2.5 text-emerald-400 font-sans">{camp.medicalTeam}</td>
                    <td className="p-2.5 text-slate-300 font-sans">{camp.foodWaterStatus}</td>
                    <td className="p-2.5 text-slate-400">{camp.contactOfficer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TACTICAL DISPATCH MODAL */}
        {dispatchModalIncident && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-eoc-card border border-blue-800/80 rounded-2xl shadow-2xl max-w-lg w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-900 pb-3">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white font-mono">
                    {t('emergency.modalTitle')}
                  </h3>
                </div>
                <button
                  onClick={() => setDispatchModalIncident(null)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmDispatch} className="space-y-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-400">TARGET DISASTER INCIDENT:</span>
                    <span className={`px-2 py-0.2 rounded font-bold border ${getPriorityBadgeClass(dispatchModalIncident.priority.tier)}`}>
                      {getLocalizedPriority(dispatchModalIncident.priority.tier)} ({dispatchModalIncident.priority.score}/100)
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm">{dispatchModalIncident.location}</div>
                  <div className="text-sky-400 font-mono text-[11px]">
                    {dispatchModalIncident.district}, {dispatchModalIncident.state} • Road: {dispatchModalIncident.roadName} ({dispatchModalIncident.roadStatus})
                  </div>
                  <p className="text-slate-300 text-[11px] pt-1 border-t border-slate-800/80">
                    {dispatchModalIncident.recommendedAction}
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] font-bold mb-1">
                    {t('emergency.assignedTeam')}
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold text-xs focus:outline-none focus:border-sky-500"
                  >
                    {responseTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.personnelCount} Pax - {team.status}) [{team.state}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Calculated ETA Box */}
                <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-800 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-blue-300 uppercase block">{t('emergency.colEta')}:</span>
                    <b className="text-white text-base">
                      {dispatchModalIncident.estimatedEtaMinutes} Minutes Transit
                    </b>
                  </div>
                  <span className="text-[10px] text-blue-300 bg-blue-900/60 px-2 py-1 rounded border border-blue-700">
                    {dispatchModalIncident.nearestTeamDistanceKm.toFixed(0)} km via mountain convoy
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDispatchModalIncident(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold text-xs"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-blue-950 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{t('emergency.confirmDispatch')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
