'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { FieldReport, RiskLevel } from '@/types';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Camera, 
  AlertTriangle, 
  Plus,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const { fieldReports, verifyFieldReport } = useEOC();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);

  const filteredReports = fieldReports.filter((rep) => {
    const matchesSearch =
      rep.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.landmark.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.reporterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rep.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerify = (id: string, isVerified: boolean) => {
    verifyFieldReport(id, isVerified ? 'Verified' : 'Dismissed');
    if (selectedReport?.id === id) {
      setSelectedReport((prev) =>
        prev ? { ...prev, verificationStatus: isVerified ? 'Verified' : 'Dismissed' } : null
      );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                CITIZEN & FIELD OFFICER REPORT VERIFICATION QUEUE
              </h1>
              <p className="text-xs text-slate-400">
                Crowdsourced landslide reports, road cracks & community disaster submissions
              </p>
            </div>
          </div>
          <Link
            href="/field-report"
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-950 transition-all self-start md:self-auto"
          >
            <Send className="h-3.5 w-3.5" />
            <span>+ New Field Submission</span>
          </Link>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-eoc-card p-3.5 rounded-xl border border-eoc-border text-xs">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reporter, landmark, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Verification Statuses</option>
              <option value="Pending Verification">Pending Verification (New)</option>
              <option value="Verified">Verified (Elevated to Incident)</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {/* Reports Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const isPending = report.verificationStatus === 'Pending Verification';
            const isVerified = report.verificationStatus === 'Verified';

            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isPending
                    ? 'bg-amber-950/20 border-amber-800/80 shadow-md shadow-amber-950/30'
                    : isVerified
                    ? 'bg-eoc-card border-slate-700 hover:border-slate-500'
                    : 'bg-slate-900/40 border-slate-800 opacity-70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {report.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        isPending
                          ? 'bg-amber-900 text-amber-200 border-amber-700 animate-pulse'
                          : isVerified
                          ? 'bg-emerald-900 text-emerald-200 border-emerald-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {report.verificationStatus}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <SeverityBadge level={report.severity} size="sm" />
                      <span className="text-xs font-bold text-white">
                        {report.hazardType}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-100 line-clamp-1">
                      {report.landmark}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{report.district}, {report.state}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    {report.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-sky-400" />
                      {report.reporterName} ({report.reporterType})
                    </span>
                    <span>{report.reportedAt}</span>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(report.id, true);
                        }}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-1.5 rounded text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Verify & Elevate</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(report.id, false);
                        }}
                        className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-1.5 rounded text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Report Inspection Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-eoc-border pb-3">
                <div className="flex items-center gap-2">
                  <SeverityBadge level={selectedReport.severity} size="md" />
                  <span className="font-mono text-xs font-bold text-sky-400">
                    {selectedReport.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedReport.landmark}
                  </h3>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                    {selectedReport.district}, {selectedReport.state} • GPS: {selectedReport.lat.toFixed(4)}°N, {selectedReport.lng.toFixed(4)}°E
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Ground Observation Notes:</span>
                  <p className="text-slate-200">{selectedReport.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-eoc-surface p-2.5 rounded border border-eoc-border">
                    <span className="text-slate-400 block font-sans">Reporter Details:</span>
                    <b className="text-white">{selectedReport.reporterName}</b>
                    <div className="text-sky-400 font-mono text-[10px] mt-0.5">
                      {selectedReport.reporterType} • {selectedReport.contactNumber}
                    </div>
                  </div>

                  <div className="bg-eoc-surface p-2.5 rounded border border-eoc-border">
                    <span className="text-slate-400 block font-sans">Verification Status:</span>
                    <b className="text-amber-400">{selectedReport.verificationStatus}</b>
                    {selectedReport.assignedOfficer && (
                      <div className="text-slate-300 text-[10px] mt-0.5">
                        Officer: {selectedReport.assignedOfficer}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-800">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs font-semibold"
                >
                  Close
                </button>

                {selectedReport.verificationStatus === 'Pending Verification' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(selectedReport.id, false)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => handleVerify(selectedReport.id, true)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verify & Elevate</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
