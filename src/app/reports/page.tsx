'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFieldReports, FieldReportRecord, ReportStatus, ReportIncidentType } from '@/services/reporting';
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
  Send,
  X,
  Sparkles,
  Flame,
  Check,
  Eye,
  Wrench,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<FieldReportRecord | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');

  const { reports, isLoading, updateReportStatus } = useFieldReports(statusFilter, typeFilter);

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStatusChange = async (id: string, newStatus: ReportStatus) => {
    await updateReportStatus(id, newStatus, adminNoteInput);
    if (selectedReport?.id === id) {
      setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'NEW':
        return (
          <span className="bg-sky-950 text-sky-300 border border-sky-700 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
            NEW SUBMISSION
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            VERIFIED
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="bg-amber-950 text-amber-300 border border-amber-700 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <Clock className="h-3 w-3" />
            INVESTIGATING
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-slate-400" />
            RESOLVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase flex items-center gap-1">
            <XCircle className="h-3 w-3 text-rose-400" />
            REJECTED
          </span>
        );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Operations Header */}
        <div className="bg-eoc-card p-4 md:p-5 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/80 shadow-inner">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                  FIELD REPORT MODERATION & VERIFICATION QUEUE
                </h1>
                <span className="bg-amber-900/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-700/50">
                  {reports.length} Reports Logged
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage crowdsourced citizen observations, AI computer vision damage findings, and quick response dispatches
              </p>
            </div>
          </div>

          <Link
            href="/field-report"
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-md shadow-amber-950 transition-all self-start md:self-auto active:scale-95"
          >
            <Send className="h-3.5 w-3.5" />
            <span>+ New Field Submission</span>
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-eoc-card p-3.5 rounded-xl border border-eoc-border text-xs">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Incident ID, location, reporter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase mr-1">Status:</span>
            {['ALL', 'NEW', 'VERIFIED', 'INVESTIGATING', 'RESOLVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                  statusFilter === st
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-950'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Type filter dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none"
            >
              <option value="ALL">All Hazard Types</option>
              <option value="Landslide">Landslide</option>
              <option value="Road Blockage">Road Blockage</option>
              <option value="Crack">Crack</option>
              <option value="Slope Movement">Slope Movement</option>
              <option value="Flood">Flood</option>
            </select>
          </div>
        </div>

        {/* Report Moderation Table */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Incident ID</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Reporter</th>
                  <th className="p-3.5">Time</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredReports.map((rep) => {
                  const isSelected = selectedReport?.id === rep.id;

                  return (
                    <tr
                      key={rep.id}
                      onClick={() => setSelectedReport(rep)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-950/40 border-l-4 border-l-amber-400'
                          : rep.status === 'NEW'
                          ? 'bg-sky-950/15 hover:bg-sky-950/30'
                          : rep.severity === 'CRITICAL'
                          ? 'bg-red-950/10 hover:bg-red-950/25'
                          : 'hover:bg-slate-900/50'
                      }`}
                    >
                      {/* Incident ID */}
                      <td className="p-3.5">
                        <span className="font-bold text-sky-400 font-mono">{rep.id}</span>
                        {rep.photoUrl && (
                          <span className="text-[10px] text-slate-500 ml-1.5">📷 Photo</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="p-3.5 font-sans font-semibold text-white">
                        {rep.incidentType}
                      </td>

                      {/* Location */}
                      <td className="p-3.5">
                        <div className="font-sans font-semibold text-slate-200 truncate max-w-[200px]">
                          {rep.village}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans flex items-center gap-1">
                          <MapPin className="h-2.5 w-2.5 text-sky-400" />
                          {rep.district}, {rep.state}
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="p-3.5 font-sans">
                        <SeverityBadge level={rep.severity} size="sm" pulse={rep.severity === 'CRITICAL'} />
                      </td>

                      {/* Reporter */}
                      <td className="p-3.5">
                        <div className="font-sans text-slate-200 font-medium">{rep.reporterName}</div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          [{rep.reporterType}]
                        </div>
                      </td>

                      {/* Time */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {new Date(rep.timestamp).toLocaleTimeString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {getStatusBadge(rep.status)}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(rep);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-amber-900 text-amber-300 rounded text-[10px] font-sans font-semibold inline-flex items-center gap-1 transition-all"
                        >
                          <span>Review</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Report Inspection Drawer / Moderation Panel */}
        {selectedReport && (
          <div className="bg-gradient-to-br from-slate-900 via-eoc-card to-slate-950 border border-amber-900/60 rounded-xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono">
                  MODERATION INSPECTOR — {selectedReport.id}
                </span>
                {getStatusBadge(selectedReport.status)}
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Grid: Details (7 cols) vs Media & AI Vision (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Report Information (7 cols) */}
              <div className="lg:col-span-7 space-y-3.5 text-xs font-sans">
                {/* Location & Coordinates */}
                <div className="bg-eoc-surface p-3.5 rounded-lg border border-eoc-border space-y-1 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Incident Location:</span>
                  <div className="text-sm font-bold text-white font-sans">
                    {selectedReport.village}, {selectedReport.district} ({selectedReport.state})
                  </div>
                  <div className="text-[11px] text-sky-400">
                    Coordinates: {selectedReport.latitude.toFixed(4)}° N, {selectedReport.longitude.toFixed(4)}° E
                  </div>
                </div>

                {/* Narrative Description */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block font-semibold">
                    Observer Narrative:
                  </span>
                  <p className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-slate-200 leading-relaxed text-xs">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Impact Metrics */}
                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">ROADWAY</span>
                    <span className={`font-bold ${selectedReport.roadBlocked ? 'text-red-400' : 'text-emerald-400'}`}>
                      {selectedReport.roadBlocked ? 'BLOCKED' : 'CLEAR'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">STRUCTURES</span>
                    <span className="font-bold text-amber-400">
                      {selectedReport.structuresAtRisk || 0} at Risk
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">REPORTER</span>
                    <span className="font-bold text-purple-300">
                      {selectedReport.reporterType}
                    </span>
                  </div>
                </div>

                {/* Status Moderation Controls */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                    MODERATION ACTIONS & WORKFLOW TRANSITIONS:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(selectedReport.id, 'VERIFIED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Mark Verified</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedReport.id, 'INVESTIGATING')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      <span>Dispatch Investigation (QRT)</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedReport.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Mark Resolved</span>
                    </button>

                    <button
                      onClick={() => handleStatusChange(selectedReport.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-lg font-mono text-xs font-bold border border-rose-800 flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="h-3.5 w-3.5 text-rose-400" />
                      <span>Reject (Spam/Invalid)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Media & AI Computer Vision Diagnostic (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                {selectedReport.photoUrl ? (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block font-semibold">
                      Attached Field Capture:
                    </span>
                    <div className="rounded-xl overflow-hidden border border-slate-800 shadow-md">
                      <img
                        src={selectedReport.photoUrl}
                        alt="Hazard Capture"
                        className="w-full h-44 object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-32 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs font-mono">
                    No Photo Attached
                  </div>
                )}

                {/* AI Computer Vision Damage Card */}
                {selectedReport.aiVisionAnalysis && (
                  <div className="bg-purple-950/40 border border-purple-800/80 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-purple-900/60 pb-1.5">
                      <div className="flex items-center gap-1.5 text-purple-300 font-mono font-bold text-[11px]">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span>AI VISION DIAGNOSTIC</span>
                      </div>
                      <span className="text-[11px] font-mono text-purple-300 font-bold">
                        {(selectedReport.aiVisionAnalysis.confidence * 100).toFixed(0)}% Conf
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-white block">
                        {selectedReport.aiVisionAnalysis.detectedIssue}
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {selectedReport.aiVisionAnalysis.observations}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedReport.aiVisionAnalysis.geotechnicalTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] bg-slate-900 text-sky-300 px-2 py-0.5 rounded border border-slate-800 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
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
