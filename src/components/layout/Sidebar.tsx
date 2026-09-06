'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEOC } from '@/context/EOCContext';
import { useI18n } from '@/context/I18nContext';
import {
  LayoutDashboard,
  Map as MapIcon,
  Cpu,
  CloudRain,
  ActivitySquare,
  FileSpreadsheet,
  GitFork,
  AlertOctagon,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  Settings as SettingsIcon,
  Send,
  ChevronLeft,
  ChevronRight,
  Shield,
  PhoneCall,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { eocStats, alerts, incidents, fieldReports } = useEOC();
  const { t } = useI18n();

  const activeAlertsCount = alerts.filter(a => a.status === 'Active').length;
  const activeIncidentsCount = incidents.filter(i => i.status === 'Active').length;
  const pendingReportsCount = fieldReports.filter(r => r.verificationStatus === 'Pending Verification').length;

  const navItems = [
    {
      label: t('nav.overview'),
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: t('nav.map'),
      href: '/map',
      icon: MapIcon,
      badge: `${eocStats.activeCriticalZones} ${t('risk.levels.CRITICAL')}`,
      badgeColor: 'bg-red-950 text-red-400 border-red-800',
    },
    {
      label: t('nav.predictions'),
      href: '/predictions',
      icon: Cpu,
      badge: t('nav.aiActive'),
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    },
    {
      label: t('nav.weather'),
      href: '/weather',
      icon: CloudRain,
      badge: t('nav.imdLive'),
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    },
    {
      label: t('nav.sensors'),
      href: '/sensors',
      icon: ActivitySquare,
      badge: `${eocStats.sensorsOnline}/${eocStats.totalSensors}`,
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    {
      label: t('nav.reports'),
      href: '/reports',
      icon: FileSpreadsheet,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} ${t('common.pending')}` : null,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      label: t('nav.fieldReport'),
      href: '/field-report',
      icon: Send,
      badge: t('nav.citizenSdrf'),
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    },
    {
      label: t('nav.offlineQueue'),
      href: '/offline-queue',
      icon: PhoneCall,
      badge: t('nav.pwaSync'),
      badgeColor: 'bg-sky-950 text-sky-300 border-sky-800',
    },
    {
      label: t('nav.roads'),
      href: '/roads',
      icon: GitFork,
      badge: `${eocStats.roadsBlocked} ${t('kpi.roadsBlocked')}`,
      badgeColor: 'bg-orange-950 text-orange-400 border-orange-800',
    },
    {
      label: t('nav.alerts'),
      href: '/alerts',
      icon: AlertOctagon,
      badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null,
      badgeColor: 'bg-red-900 text-white font-bold',
    },
    {
      label: t('nav.emergency'),
      href: '/emergency',
      icon: LifeBuoy,
      badge: `${eocStats.activeResponseTeams}`,
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
    },
    {
      label: t('nav.analytics'),
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      label: t('nav.admin'),
      href: '/admin',
      icon: ShieldCheck,
      badge: null,
    },
    {
      label: t('nav.settings'),
      href: '/settings',
      icon: SettingsIcon,
      badge: null,
    },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen bg-eoc-surface border-r border-eoc-border flex flex-col justify-between transition-all duration-200 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Brand Section */}
      <div>
        <div className="p-3.5 border-b border-eoc-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-900 flex items-center justify-center text-white font-bold shadow-md shadow-sky-950 shrink-0 border border-sky-400/30">
              <Shield className="h-5 w-5 text-sky-200" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm text-slate-100 tracking-wider font-mono truncate">
                  LANDSLIDEGUARD
                </span>
                <span className="text-[10px] text-sky-400 font-semibold truncate uppercase">
                  {t('common.nodeTitle')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-eoc-card transition-all hidden md:block"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Action Button: Citizen / Field Officer Report */}
        <div className="p-2.5">
          <Link
            href="/field-report"
            className={`flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-bold transition-all ${
              pathname === '/field-report'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/50'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md'
            }`}
            title="Submit Citizen / Field Landslide Report"
          >
            <Send className="h-3.5 w-3.5" />
            {!collapsed && <span>{t('nav.submitReportBtn')}</span>}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="px-2 py-1 space-y-0.5 overflow-y-auto max-h-[calc(100vh-250px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-sky-950/80 text-sky-300 border border-sky-700/60 shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-eoc-card hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Emergency Helpdesk */}
      <div className="p-3 border-t border-eoc-border bg-eoc-card/60">
        {!collapsed ? (
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>{t('common.helpline')}</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {t('common.jointOperations')}
            </div>
          </div>
        ) : (
          <div className="flex justify-center text-amber-400" title={t('common.helpline')}>
            <PhoneCall className="h-4 w-4" />
          </div>
        )}
      </div>
    </aside>
  );
}
