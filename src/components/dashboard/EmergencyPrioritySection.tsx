'use client';

import React from 'react';
import { useEOC } from '@/context/EOCContext';
import { useI18n } from '@/context/I18nContext';
import { SeverityBadge } from '../common/SeverityBadge';
import { LifeBuoy, Users, Navigation, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export function EmergencyPrioritySection() {
  const { incidents } = useEOC();
  const { t, getLocalizedPriority } = useI18n();

  const priorityIncidents = incidents
    .filter((i) => i.riskLevel === 'CRITICAL' || i.riskLevel === 'HIGH')
    .slice(0, 4);

  return (
    <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-xl overflow-hidden">
      <div className="p-4 border-b border-eoc-border bg-eoc-surface flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LifeBuoy className="h-5 w-5 text-sky-400 animate-spin-slow" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {t('emergency.title')}
            </h3>
            <p className="text-[11px] text-slate-400">
              {t('emergency.subtitle')}
            </p>
          </div>
        </div>
        <Link
          href="/emergency"
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
        >
          <span>{t('emergency.relationshipChainTitle')}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-eoc-border/60">
        {priorityIncidents.map((inc, index) => {
          const priorityTag = index === 0 ? getLocalizedPriority('P1') : index === 1 ? getLocalizedPriority('P2') : getLocalizedPriority('P3');
          const isP1 = index === 0;

          return (
            <div
              key={inc.id}
              className={`p-4 transition-all hover:bg-slate-900/50 ${
                isP1 ? 'bg-red-950/20' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Left info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded border ${
                        isP1
                          ? 'bg-red-900 text-white border-red-700 animate-pulse'
                          : 'bg-orange-950 text-orange-300 border-orange-800'
                      }`}
                    >
                      {priorityTag}
                    </span>
                    <SeverityBadge level={inc.riskLevel} size="sm" />
                    <span className="text-xs font-bold text-white">
                      {inc.location}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({inc.district}, {inc.state})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {inc.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-1 text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                      <span>{t('emergency.colPopulation')}:</span>
                      <b className="text-white font-mono">{inc.affectedPopulation.toLocaleString()}</b>
                    </div>
                    <div className="flex items-center gap-1">
                      <Navigation className="h-3.5 w-3.5 text-amber-400" />
                      <span>{t('emergency.colRoadStatus')}:</span>
                      <b className="text-amber-300">{inc.roadStatus}</b>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-sky-400" />
                      <span>{t('emergency.colResponseTeam')}:</span>
                      <b className="text-sky-300">
                        {inc.responseTeamsDispatched.length > 0
                          ? inc.responseTeamsDispatched.join(', ')
                          : t('common.pending')}
                      </b>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 lg:w-72">
                  <div className="text-[11px] bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex-1">
                    <span className="text-[9px] font-mono font-bold text-red-400 uppercase block mb-0.5">
                      {t('drawer.recommendedDirectives')}:
                    </span>
                    <div className="text-slate-200 line-clamp-2 text-[10px]">
                      {inc.recommendedAction}
                    </div>
                  </div>

                  <Link
                    href="/emergency"
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-sky-950 transition-all text-center whitespace-nowrap"
                  >
                    <LifeBuoy className="h-3.5 w-3.5" />
                    <span>{t('emergency.dispatch')}</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
