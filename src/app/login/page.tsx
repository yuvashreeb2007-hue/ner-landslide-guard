'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  User, 
  Key, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  Activity, 
  Radio, 
  RefreshCw,
  Building2,
  Users,
  HardHat,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, demoLogin, demoAccounts, user, role, isLoading, getRoleLandingRoute } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRole, setSuccessRole] = useState<string | null>(null);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessRole('Authenticated');
      const targetPath = getRoleLandingRoute(result.user?.role);
      setTimeout(() => {
        router.push(targetPath);
      }, 400);
    } else {
      setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoSwitch = async (targetRole: UserRole) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const ok = await demoLogin(targetRole);
    setIsSubmitting(false);

    if (ok) {
      setSuccessRole(targetRole);
      const targetPath = getRoleLandingRoute(targetRole);
      setTimeout(() => {
        router.push(targetPath);
      }, 350);
    }
  };

  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case 'ADMIN': return <ShieldAlert className="h-5 w-5 text-purple-400" />;
      case 'DISTRICT_OFFICER': return <Building2 className="h-5 w-5 text-sky-400" />;
      case 'FIELD_OFFICER': return <HardHat className="h-5 w-5 text-amber-400" />;
      case 'CITIZEN': return <Users className="h-5 w-5 text-emerald-400" />;
    }
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'ADMIN': return 'bg-purple-950 text-purple-300 border-purple-700';
      case 'DISTRICT_OFFICER': return 'bg-sky-950 text-sky-300 border-sky-700';
      case 'FIELD_OFFICER': return 'bg-amber-950 text-amber-300 border-amber-700';
      case 'CITIZEN': return 'bg-emerald-950 text-emerald-300 border-emerald-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans">
      {/* Top Brand Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 text-white shadow-lg shadow-sky-950">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm md:text-base tracking-wider text-white font-mono">
                NER LANDSLIDEGUARD
              </span>
              <span className="px-2 py-0.2 rounded text-[10px] bg-red-950 text-red-400 font-mono font-bold border border-red-800">
                EOC NODE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              National Disaster Management & North Eastern Council Early Warning
            </p>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Security Clearance Level:</span>
          <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${getRoleBadgeStyle(role)}`}>
            {role}
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Standard Login Form */}
        <div className="lg:col-span-5 bg-eoc-card border border-eoc-border rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-[11px] text-sky-400">
              <Lock className="h-3.5 w-3.5" />
              <span>ROLE-BASED ACCESS CONTROL (RBAC)</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white font-mono">
              EOC OPERATIONAL LOGIN
            </h1>
            <p className="text-xs text-slate-400">
              Enter official command credentials to access early warning telemetries and tactical response controls.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/80 border border-red-700 text-red-200 text-xs rounded-xl flex items-center gap-2 font-mono">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successRole && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-mono animate-pulse">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Authentication successful. Redirecting to Command Center...</span>
            </div>
          )}

          <form onSubmit={handleCredentialSubmit} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold block">Username or Official Email</label>
              <div className="relative">
                <User className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or commander.eoc@ner.gov.in"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold">Password</label>
              </div>
              <div className="relative">
                <Key className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Command Center</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Server Mode: <b className="text-emerald-400">FastAPI JWT Protected</b></span>
            <span>Salt: <b className="text-slate-300">Bcrypt-12</b></span>
          </div>
        </div>

        {/* Right Column: Demo Mode One-Click Persona Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-4 rounded-xl border border-purple-900/60 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="text-xs md:text-sm font-bold text-white uppercase font-mono tracking-wider">
                  DEMO MODE INSTANT ROLE SWITCHER
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select any persona to immediately evaluate role-based permission boundaries without typing passwords
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-950 text-amber-300 text-[10px] font-mono font-bold rounded border border-amber-700 shrink-0">
              Demo Mode Active
            </span>
          </div>

          {/* 4 Demo Account Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoAccounts.map((acc) => {
              const isActive = role === acc.role;

              return (
                <div
                  key={acc.role}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isActive
                      ? 'bg-slate-900/90 border-sky-500 shadow-xl ring-1 ring-sky-500/50'
                      : 'bg-eoc-card border-eoc-border hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRoleBadgeStyle(acc.role)}`}>
                        {acc.role}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-sky-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                        {getRoleIcon(acc.role)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs leading-snug">
                          {acc.title}
                        </h4>
                        <span className="text-[11px] text-slate-300 font-mono block mt-0.5">
                          {acc.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[200px]">
                          {acc.department}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                      {acc.description}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono uppercase block">Clearance Permissions:</span>
                      <div className="flex flex-wrap gap-1">
                        {acc.permissions_summary.map((perm, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDemoSwitch(acc.role)}
                    disabled={isSubmitting}
                    className={`w-full py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-slate-800 text-sky-300 border border-slate-700'
                        : 'bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-700'
                    }`}
                  >
                    <span>{isActive ? 'Continue as ' + acc.role : 'Switch to ' + acc.role}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto pt-4 border-t border-slate-800/60 text-center text-[11px] text-slate-500 font-mono">
        NER LandslideGuard • Disaster Response & Early Warning Role-Based Security Gateway • State Disaster Management Authorities
      </div>
    </div>
  );
}
