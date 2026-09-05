'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { ResponseTeam, Incident } from '@/types';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { 
  LifeBuoy, 
  Users, 
  Shield, 
  MapPin, 
  Phone, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Send,
  Building2,
  Tent,
  ArrowRight
} from 'lucide-react';

const RELIEF_CAMPS = [
  { name: 'Haflong Government College Relief Hub', district: 'Dima Hasao', state: 'Assam', capacity: 1500, currentOccupancy: 840, medicalTeam: 'Active (2 Doctors)', foodWater: 'Adequate (5 Days)' },
  { name: 'Singtam Community Hall & School', district: 'Pakyong', state: 'Sikkim', capacity: 900, currentOccupancy: 620, medicalTeam: 'Active (1 Doctor, 4 Nurses)', foodWater: 'Adequate (3 Days)' },
  { name: 'Phesama Village Council Hall', district: 'Kohima', state: 'Nagaland', capacity: 600, currentOccupancy: 380, medicalTeam: 'Mobile Health Unit', foodWater: 'Supplied by NSDMA' },
  { name: 'Mawkdok Tourist Lodge Shelter', district: 'East Khasi Hills', state: 'Meghalaya', capacity: 450, currentOccupancy: 210, medicalTeam: 'SDRF First Aid Post', foodWater: 'Adequate' },
  { name: 'Yupia Multipurpose Indoor Stadium', district: 'Papum Pare', state: 'Arunachal Pradesh', capacity: 1200, currentOccupancy: 410, medicalTeam: 'District Hospital Team', foodWater: 'Adequate' },
];

export default function EmergencyPage() {
  const { incidents, responseTeams, dispatchResponseTeam } = useEOC();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(responseTeams[0].id);

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIncident && selectedTeamId) {
      dispatchResponseTeam(selectedIncident.id, selectedTeamId);
      setSelectedIncident(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-800">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                INCIDENT COMMAND SYSTEM (ICS) & SEARCH & RESCUE DISPATCH
              </h1>
              <p className="text-xs text-slate-400">
                NDRF, SDRF, Border Roads Organisation & District Disaster Management Resource Allocations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-sky-400 font-bold">
              🎖️ 18 Battalion Response Units Operational
            </span>
          </div>
        </div>

        {/* Response Teams Fleet Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
            NDRF & SDRF SPECIALIZED MOUNTAIN RESCUE BATTALIONS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {responseTeams.map((team) => {
              const isDeployed = team.status === 'Deployed';

              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isDeployed
                      ? 'bg-blue-950/30 border-blue-800/80 shadow-md shadow-blue-950/30'
                      : 'bg-eoc-card border-eoc-border'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                        {team.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          isDeployed
                            ? 'bg-blue-900 text-blue-200 border-blue-700'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {team.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{team.name}</h4>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {team.unit} • {team.state}
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">Personnel:</span>
                        <b className="text-white">{team.personnelCount} Rescuers</b>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">Base Post:</span>
                        <span className="text-slate-200">{team.baseLocation}</span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block">
                        Equipment Loadout:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {team.equipment.map((eq, eIdx) => (
                          <span
                            key={eIdx}
                            className="bg-slate-900 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Officer: {team.contactOfficer}</span>
                    <span className="text-sky-400">{team.contactPhone}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Incidents Dispatch Queue */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-eoc-border pb-2.5">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              PRIORITY INCIDENT DISPATCH QUEUE ({activeIncidents.length} Pending Actions)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Standard Operating Procedure: Level-2 Emergency</span>
          </div>

          <div className="space-y-3">
            {activeIncidents.map((inc) => (
              <div
                key={inc.id}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge level={inc.riskLevel} size="sm" />
                    <span className="font-mono text-xs font-bold text-sky-400">{inc.id}</span>
                    <span className="text-xs font-bold text-white">{inc.location}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({inc.district}, {inc.state})</span>
                  </div>
                  <p className="text-xs text-slate-300">{inc.description}</p>
                  <div className="text-[11px] text-amber-300 font-semibold">
                    Directive: {inc.recommendedAction}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-950 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Assign Response Unit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relief Shelter Hubs Table */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                DISTRICT RELIEF CAMPS & EVACUATION HUBS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">DDMA Designated Nodes</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Relief Hub Name</th>
                  <th className="p-2.5">District / State</th>
                  <th className="p-2.5">Capacity</th>
                  <th className="p-2.5">Current Evacuees</th>
                  <th className="p-2.5">Medical Unit</th>
                  <th className="p-2.5">Provisions Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {RELIEF_CAMPS.map((camp, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-2.5 font-bold text-white font-sans">{camp.name}</td>
                    <td className="p-2.5 text-slate-400">{camp.district}, {camp.state}</td>
                    <td className="p-2.5 text-slate-300">{camp.capacity.toLocaleString()} Pax</td>
                    <td className="p-2.5 font-bold text-sky-300">
                      {camp.currentOccupancy.toLocaleString()} (
                      {Math.round((camp.currentOccupancy / camp.capacity) * 100)}%)
                    </td>
                    <td className="p-2.5 text-emerald-400 font-sans">{camp.medicalTeam}</td>
                    <td className="p-2.5 text-slate-300 font-sans">{camp.foodWater}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-eoc-card border border-blue-800/80 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-blue-900 pb-3">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white font-mono">
                    DISPATCH SEARCH & RESCUE UNIT
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDispatch} className="space-y-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">TARGET INCIDENT:</div>
                  <div className="font-bold text-white text-sm">{selectedIncident.location}</div>
                  <div className="text-sky-400 font-mono text-[11px] mt-0.5">
                    {selectedIncident.district}, {selectedIncident.state} • Severity: {selectedIncident.riskLevel}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Available Battalion Task Force:
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-semibold"
                  >
                    {responseTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.personnelCount} Pax - {team.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-md shadow-blue-950"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Authorize Dispatch Now</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
