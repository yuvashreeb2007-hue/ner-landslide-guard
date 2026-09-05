'use client';

import React, { useState } from 'react';
import { useEOC } from '@/context/EOCContext';
import { Incident, IncidentType, IncidentStatus } from '@/types';
import { SeverityBadge } from '../common/SeverityBadge';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  LifeBuoy, 
  Eye,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export function IncidentsTable() {
  const { incidents, setSelectedZone, riskZones } = useEOC();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.state.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || inc.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleInspectOnMap = (inc: Incident) => {
    // Find matching risk zone or create focus
    const zone = riskZones.find(z => z.district === inc.district) || riskZones[0];
    setSelectedZone(zone);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-xl overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-eoc-border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-eoc-surface">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              LIVE VERIFIED INCIDENTS FEED
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-time operational log of ground slope failures, cracks & highway lifelines
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
          {/* Search Box */}
          <div className="relative flex-1 md:w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search district, highway..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Hazard Types</option>
            <option value="Landslide">Landslides</option>
            <option value="Crack">Tension Cracks</option>
            <option value="Road Blockage">Road Blockages</option>
            <option value="Slope Movement">Slope Creep</option>
            <option value="Flash Flood">Flash Floods</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Response Dispatched">Dispatched</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-eoc-border">
            <tr>
              <th className="p-3">Incident ID</th>
              <th className="p-3">District / State</th>
              <th className="p-3">Location & Highway</th>
              <th className="p-3">Risk Level</th>
              <th className="p-3">Hazard Type</th>
              <th className="p-3">Reported Time</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-eoc-border/60 font-sans">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400">
                  No incidents matching the current search and filter criteria.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc) => {
                let statusBadge = 'bg-slate-800 text-slate-300 border-slate-700';
                if (inc.status === 'Active') {
                  statusBadge = 'bg-red-950/80 text-red-400 border-red-800 animate-pulse';
                } else if (inc.status === 'Response Dispatched') {
                  statusBadge = 'bg-blue-950/80 text-blue-300 border-blue-800';
                } else if (inc.status === 'Resolved') {
                  statusBadge = 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
                }

                return (
                  <tr
                    key={inc.id}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => setSelectedIncident(inc)}
                  >
                    <td className="p-3 font-mono font-bold text-sky-400 whitespace-nowrap">
                      {inc.id}
                    </td>
                    <td className="p-3 font-medium text-white whitespace-nowrap">
                      <div>{inc.district}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inc.state}</div>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-semibold text-slate-200 line-clamp-1">
                        {inc.location}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {inc.description}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <SeverityBadge level={inc.riskLevel} size="sm" pulse={inc.riskLevel === 'CRITICAL'} />
                    </td>
                    <td className="p-3 whitespace-nowrap font-medium text-slate-200">
                      {inc.type}
                    </td>
                    <td className="p-3 whitespace-nowrap text-[11px] font-mono text-slate-400">
                      {inc.reportedTime}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-slate-900 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                        {inc.source}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${statusBadge}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInspectOnMap(inc);
                          }}
                          className="p-1.5 rounded bg-slate-800 hover:bg-sky-900 text-slate-300 hover:text-sky-300 border border-slate-700"
                          title="Focus on Map"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                        </button>
                        <Link
                          href="/emergency"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800"
                          title="Dispatch Response Team"
                        >
                          <LifeBuoy className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-eoc-card border border-eoc-border rounded-xl shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-eoc-border pb-3">
              <div className="flex items-center gap-2">
                <SeverityBadge level={selectedIncident.riskLevel} size="md" />
                <span className="font-mono text-xs font-bold text-sky-400">
                  {selectedIncident.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="text-base font-bold text-white">
                {selectedIncident.location}
              </h3>
              <p className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                {selectedIncident.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-eoc-surface p-2 rounded border border-eoc-border">
                  <span className="text-slate-400">District / State:</span>
                  <div className="font-bold text-white">{selectedIncident.district}, {selectedIncident.state}</div>
                </div>
                <div className="bg-eoc-surface p-2 rounded border border-eoc-border">
                  <span className="text-slate-400">Road Lifeline Status:</span>
                  <div className="font-bold text-amber-400">{selectedIncident.roadStatus}</div>
                </div>
                <div className="bg-eoc-surface p-2 rounded border border-eoc-border">
                  <span className="text-slate-400">Population Affected:</span>
                  <div className="font-bold text-white">{selectedIncident.affectedPopulation.toLocaleString()}</div>
                </div>
                <div className="bg-eoc-surface p-2 rounded border border-eoc-border">
                  <span className="text-slate-400">Source:</span>
                  <div className="font-bold text-sky-400">{selectedIncident.source} ({selectedIncident.reporterName || 'Patrol'})</div>
                </div>
              </div>

              {selectedIncident.responseTeamsDispatched.length > 0 && (
                <div className="bg-blue-950/40 p-2.5 rounded border border-blue-900/60">
                  <span className="text-[10px] font-mono text-blue-300 font-bold uppercase block mb-1">
                    Dispatched Response Forces:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedIncident.responseTeamsDispatched.map((t, i) => (
                      <span key={i} className="bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded text-[10px] border border-blue-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-red-950/40 p-2.5 rounded border border-red-900/60">
                <span className="text-[10px] font-mono text-red-400 font-bold uppercase block mb-0.5">
                  Recommended Action Directive:
                </span>
                <p className="text-slate-200">{selectedIncident.recommendedAction}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
              <Link
                href="/emergency"
                className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 text-xs font-bold flex items-center gap-1"
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                Manage in Emergency Operations
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
