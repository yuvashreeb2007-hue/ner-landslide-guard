'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';
import { ShieldAlert, Lock, ArrowRight, UserCheck, RefreshCw, KeyRound } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  moduleName?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  moduleName = 'Classified Operations Module',
}: ProtectedRouteProps) {
  const { user, role, isLoading, demoLogin, getRoleDetails } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8 bg-eoc-card rounded-2xl border border-eoc-border text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin text-sky-400 mr-3" />
        <span className="font-mono text-xs">Verifying EOC security credentials...</span>
      </div>
    );
  }

  // Check if role is allowed
  const isAllowed =
    role === 'ADMIN' ||
    (requiredRoles ? requiredRoles.includes(role) : true);

  if (!isAllowed) {
    const currentRoleInfo = getRoleDetails(role);
    const requiredRoleNames = requiredRoles ? requiredRoles.join(' / ') : 'ADMIN / DISTRICT_OFFICER';

    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-gradient-to-b from-slate-900 via-eoc-card to-slate-950 border border-red-900/60 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/80 border border-red-700 flex items-center justify-center text-red-400 shadow-inner">
            <Lock className="h-8 w-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 font-mono text-[11px] uppercase font-bold">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Restricted Access Clearance Required</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white font-mono tracking-tight">
              {moduleName.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your current active persona is authorized as <b className="text-slate-200">{currentRoleInfo.roleTitle}</b>. This module requires elevated clearance (<b className="text-amber-300 font-mono">{requiredRoleNames}</b>).
            </p>
          </div>

          {/* Persona Card */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-left text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>ACTIVE SESSION:</span>
              <span className={`px-2 py-0.5 rounded border ${currentRoleInfo.roleBadgeColor}`}>
                {role}
              </span>
            </div>
            <div className="text-white font-bold">{user?.full_name}</div>
            <div className="text-slate-400 text-[11px]">{user?.department} • {user?.jurisdiction}</div>
          </div>

          {/* Instant Elevation in Demo Mode */}
          <div className="space-y-3 pt-2">
            <span className="text-[11px] text-slate-400 uppercase font-mono block">
              Demo Mode One-Click Elevation:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => demoLogin('ADMIN')}
                className="px-3.5 py-2 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-700 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950"
              >
                <UserCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>Switch to EOC Admin</span>
              </button>

              <button
                onClick={() => demoLogin('DISTRICT_OFFICER')}
                className="px-3.5 py-2 bg-sky-950 hover:bg-sky-900 text-sky-200 border border-sky-700 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-950"
              >
                <UserCheck className="h-3.5 w-3.5 text-sky-400" />
                <span>Switch to District Officer</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="text-xs text-sky-400 hover:text-sky-300 font-mono inline-flex items-center gap-1 underline"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Go to Authentication Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
