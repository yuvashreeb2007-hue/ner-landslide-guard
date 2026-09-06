'use client';

import React from 'react';
import { useEOC } from '@/context/EOCContext';
import { useI18n } from '@/context/I18nContext';
import { SeverityBadge } from '../common/SeverityBadge';
import { 
  X, 
  MapPin, 
  CloudRain, 
  Droplets, 
  Mountain, 
  Layers, 
  Users, 
  Navigation, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Radio, 
  LifeBuoy
} from 'lucide-react';
import Link from 'next/link';

export function RiskZoneDrawer() {
  const { selectedZone, setSelectedZone, createEmergencyAlert } = useEOC();
  const { t } = useI18n();

  if (!selectedZone) {
    return (
      <div className="bg-eoc-card border border-eoc-border rounded-xl p-6 text-center text-slate-400 flex flex-col items-center justify-center h-full min-h-[350px]">
        <MapPin className="h-10 w-10 text-slate-600 mb-3 animate-bounce" />
        <h3 className="text-sm font-bold text-slate-200">{t('drawer.inspectorTitle')}</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {t('drawer.selectZonePrompt')}
        </p>
      </div>
    );
  }

  const isCritical = selectedZone.riskLevel === 'CRITICAL';

  const handleIssueDistrictWarning = () => {
    createEmergencyAlert({
      title: `URGENT WARNING: Severe Landslide Imminence in ${selectedZone.district}`,
      severity: isCritical ? 'RED' : 'ORANGE',
      riskLevel: selectedZone.riskLevel,
      state: selectedZone.state,
      affectedDistrict: selectedZone.district,
      affectedVillages: selectedZone.affectedVillages,
      reason: `${selectedZone.riskExplanation.primaryTrigger}. 24h rainfall: ${selectedZone.rainfall24h}mm, Soil saturation: ${selectedZone.soilMoisture}%.`,
      validUntil: 'Next 24 Hours',
      recommendedAction: selectedZone.riskExplanation.recommendedAction,
      issuedBy: 'NER LandslideGuard EOC Early Warning Node',
      capChannel: ['SMS', 'WhatsApp', 'Community Siren', 'Radio Broadcast'],
    });
  };

  return (
    <div className="bg-eoc-card border border-eoc-border rounded-xl overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Header */}
      <div className={`p-4 border-b ${isCritical ? 'bg-red-950/50 border-red-900/60' : 'bg-eoc-surface border-eoc-border'}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge level={selectedZone.riskLevel} size="md" pulse={isCritical} />
            <span className="text-xs font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
              {t('drawer.riskScore')}: {selectedZone.riskScore}/100
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              ID: {selectedZone.id}
            </span>
          </div>
          <button
            onClick={() => setSelectedZone(null)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-base font-extrabold text-white tracking-wide">
          {selectedZone.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
          <MapPin className="h-3.5 w-3.5 text-sky-400 shrink-0" />
          <span>{selectedZone.district}, {selectedZone.state}</span>
          <span>•</span>
          <span className="text-slate-400 font-mono">
            {selectedZone.lat.toFixed(4)}°N, {selectedZone.lng.toFixed(4)}°E
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-4 space-y-4 max-h-[560px] overflow-y-auto text-xs">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-eoc-surface p-2.5 rounded-lg border border-eoc-border">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1">
              <CloudRain className="h-3.5 w-3.5 text-sky-400" />
              <span>{t('drawer.rainfall24h').toUpperCase()}</span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              {selectedZone.rainfall24h} <span className="text-[10px] font-normal text-slate-400">mm</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              7-Day: {selectedZone.rainfall7d} mm
            </div>
          </div>

          <div className="bg-eoc-surface p-2.5 rounded-lg border border-eoc-border">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1">
              <Droplets className="h-3.5 w-3.5 text-cyan-400" />
              <span>{t('drawer.soilMoisture').toUpperCase()}</span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              {selectedZone.soilMoisture} <span className="text-[10px] font-normal text-slate-400">%</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Pore: {selectedZone.poreWaterPressure} kPa
            </div>
          </div>

          <div className="bg-eoc-surface p-2.5 rounded-lg border border-eoc-border">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1">
              <Mountain className="h-3.5 w-3.5 text-amber-400" />
              <span>{t('drawer.slopeAngle').toUpperCase()}</span>
            </div>
            <div className="text-base font-bold font-mono text-white">
              {selectedZone.slope}° <span className="text-[10px] font-normal text-slate-400">gradient</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Elev: {selectedZone.elevation} m
            </div>
          </div>

          <div className="bg-eoc-surface p-2.5 rounded-lg border border-eoc-border">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-1">
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>FACTOR OF SAFETY</span>
            </div>
            <div className={`text-base font-bold font-mono ${selectedZone.factorOfSafety < 1.0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {selectedZone.factorOfSafety} <span className="text-[10px] font-normal text-slate-400">FoS</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {t('drawer.historicalIncidents')}: {selectedZone.historicalLandslides}
            </div>
          </div>
        </div>

        {/* AI Explainability Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-3.5 rounded-xl border border-sky-900/40 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold font-mono text-[11px] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('drawer.keyContributingFactors')}</span>
            </div>
            <span className="text-[10px] font-mono bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
              {t('drawer.aiConfidence', { score: selectedZone.riskExplanation.aiConfidence })}
            </span>
          </div>

          <div className="mb-2">
            <h4 className="text-xs font-bold text-white mb-1">
              {t('drawer.keyContributingFactors')}
            </h4>
            <p className="text-[11px] text-amber-300 font-semibold bg-amber-950/40 p-2 rounded border border-amber-900/50">
              {selectedZone.riskExplanation.primaryTrigger}
            </p>
          </div>

          <div className="space-y-1.5 my-2.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase font-mono">
              {t('drawer.keyContributingFactors')}:
            </span>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {selectedZone.riskExplanation.contributingFactors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-sky-400 shrink-0 font-bold">›</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span><b>Formation:</b> {selectedZone.riskExplanation.geologicalFormation}</span>
          </div>
        </div>

        {/* Exposed Population & Lifeline Impact */}
        <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span>{t('emergency.colPopulation')}:</span>
            </div>
            <span className="font-bold text-white font-mono text-sm">
              {selectedZone.populationExposed.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Navigation className="h-3.5 w-3.5 text-amber-400" />
              <span>{t('emergency.stepRoad')}:</span>
            </div>
            <span className="font-semibold text-amber-300">
              {selectedZone.nearestRoad} ({selectedZone.nearestRoadDistanceKm} km)
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold block mb-1">
              {t('drawer.settlementsExposed')}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedZone.affectedVillages.map((v, i) => (
                <span
                  key={i}
                  className="bg-slate-900 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-800"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Action Directive */}
        <div className="p-3 bg-red-950/40 rounded-lg border border-red-900/60 text-[11px]">
          <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t('drawer.recommendedDirectives')}</span>
          </div>
          <p className="text-slate-200">
            {selectedZone.riskExplanation.recommendedAction}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{t('sensors.colLastUpdated')}: {selectedZone.lastUpdated}</span>
          </div>
          <span>{t('common.jointOperations')}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-eoc-surface border-t border-eoc-border flex items-center gap-2">
        <button
          onClick={handleIssueDistrictWarning}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-950 transition-all active:scale-95"
        >
          <Radio className="h-3.5 w-3.5" />
          <span>{t('header.issueCapAlert')}</span>
        </button>

        <Link
          href="/emergency"
          className="flex-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all text-center"
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          <span>{t('emergency.dispatch')}</span>
        </Link>
      </div>
    </div>
  );
}
