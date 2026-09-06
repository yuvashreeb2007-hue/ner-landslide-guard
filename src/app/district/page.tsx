'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEOC } from '@/context/EOCContext';
import { useAuth } from '@/context/AuthContext';
import { LandslideMap } from '@/components/map/LandslideMap';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { NER_STATES } from '@/data/mockData';
import { 
  Building2, 
  MapPin, 
  CloudRain, 
  Activity, 
  Users, 
  AlertTriangle, 
  GitFork, 
  LifeBuoy, 
  Radio, 
  Send,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DistrictDashboardPage() {
  const { user } = useAuth();
  const { riskZones, alerts, incidents, roads, weatherStations } = useEOC();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('Pakyong');

  // Filter items by district
  const districtZones = riskZones.filter(z => 
    z.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
    z.state === 'Sikkim'
  );

  const districtAlerts = alerts.filter(a => 
    a.affectedDistrict.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
    a.state === 'Sikkim'
  );

  const districtIncidents = incidents.filter(i => 
    i.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
    i.state === 'Sikkim'
  );

  const districtRoads = roads.filter(r => 
    r.state === 'Sikkim' || r.district?.toLowerCase().includes(selectedDistrict.toLowerCase())
  );

  const totalPopExposed = districtZones.reduce((acc, z) => acc + z.populationExposed, 0);
  const avgRainfall = weatherStations[0]?.rainfall24hMm || 142;
  const avgMoisture = districtZones[0]?.soilMoisture || 88;
  const criticalCount = districtZones.filter(z => z.riskLevel === 'CRITICAL').length;

  return (
    <MainLayout>
      <ProtectedRoute 
        requiredRoles={['ADMIN', 'DISTRICT_OFFICER']} 
        moduleName="District Disaster Management Authority (DDMA) Command Board"
      >
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/50 to-slate-900 p-4 md:p-5 rounded-xl border border-sky-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-950 text-sky-400 border border-sky-800 shadow-inner">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base md:text-xl font-black text-white font-mono tracking-wide">
                    DISTRICT DISASTER OPERATIONS BOARD
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-sky-950 text-sky-300 border border-sky-700 font-bold">
                    DDMA COMMAND
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Officer in Charge: <strong className="text-white">{user?.full_name || 'Dr. Tenzing Norbu Lepcha'}</strong> • Jurisdiction: <span className="text-sky-300">{user?.jurisdiction || 'Pakyong & East Sikkim Districts'}</span>
                </p>
              </div>
            </div>

            {/* District Selector & Action */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500"
              >
                <option value="Pakyong">Pakyong District (Sikkim)</option>
                <option value="East Sikkim">East Sikkim (Gangtok)</option>
                <option value="Dima Hasao">Dima Hasao (Assam)</option>
                <option value="East Khasi Hills">East Khasi Hills (Meghalaya)</option>
                <option value="Kamrup Metro">Kamrup Metro (Assam)</option>
              </select>

              <Link
                href="/emergency"
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-950 transition-all"
              >
                <LifeBuoy className="h-3.5 w-3.5" />
                <span>Dispatch Teams</span>
              </Link>
            </div>
          </div>

          {/* District KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow space-y-1">
              <span className="text-[10px] text-slate-400 font-mono">DISTRICT RISK LEVEL</span>
              <div className="flex items-center gap-1.5">
                <SeverityBadge level={criticalCount > 0 ? 'CRITICAL' : 'HIGH'} size="sm" />
              </div>
            </div>

            <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow space-y-1">
              <span className="text-[10px] text-slate-400 font-mono">24H RAINFALL</span>
              <div className="text-base font-black text-white font-mono flex items-center gap-1">
                <CloudRain className="h-4 w-4 text-sky-400" />
                <span>{avgRainfall} mm</span>
              </div>
            </div>

            <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow space-y-1">
              <span className="text-[10px] text-slate-400 font-mono">SOIL MOISTURE</span>
              <div className="text-base font-black text-amber-300 font-mono flex items-center gap-1">
                <Activity className="h-4 w-4 text-amber-400" />
                <span>{avgMoisture}%</span>
              </div>
            </div>

            <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow space-y-1">
              <span className="text-[10px] text-slate-400 font-mono">EXPOSED POPULATION</span>
              <div className="text-base font-black text-white font-mono flex items-center gap-1">
                <Users className="h-4 w-4 text-purple-400" />
                <span>{totalPopExposed.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow space-y-1">
              <span className="text-[10px] text-slate-400 font-mono">ACTIVE INCIDENTS</span>
              <div className="text-base font-black text-red-400 font-mono flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>{districtIncidents.length}</span>
              </div>
            </div>

            <div className="bg-eoc-card p-3 rounded-xl border border-eoc-border shadow space-y-1">
              <span className="text-[10px] text-slate-400 font-mono">BLOCKED ROADS</span>
              <div className="text-base font-black text-orange-400 font-mono flex items-center gap-1">
                <GitFork className="h-4 w-4 text-orange-400" />
                <span>{districtRoads.filter(r => r.status === 'Completely Blocked' || r.status === 'Partial Lane Open').length}</span>
              </div>
            </div>
          </div>

          {/* District Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* GIS Map Focused on District (7 Cols) */}
            <div className="lg:col-span-7 bg-eoc-card border border-eoc-border rounded-xl p-3.5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-bold text-white font-mono uppercase">
                    {selectedDistrict} District Geospatial Hazard Map
                  </span>
                </div>
                <Link href="/map" className="text-[11px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1">
                  <span>Full Map</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <LandslideMap heightClass="h-[420px]" />
            </div>

            {/* Right Column: High Risk Zones & Alerts (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* High-Risk Zones */}
              <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span>District Critical Hazard Zones</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{districtZones.length} Zones</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {districtZones.map((zone) => (
                    <div key={zone.id} className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{zone.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Slope: {zone.slope}° • Rain 24h: {zone.rainfall24h}mm • FoS: {zone.factorOfSafety.toFixed(2)}
                        </div>
                      </div>
                      <SeverityBadge level={zone.riskLevel} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Active District Alerts */}
              <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                    <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
                    <span>Active District Alerts & Advisories</span>
                  </div>
                  <Link href="/alerts" className="text-[10px] text-sky-400 hover:text-sky-300 font-mono">
                    View All
                  </Link>
                </div>

                <div className="space-y-2">
                  {districtAlerts.slice(0, 2).map((alert) => (
                    <div key={alert.id} className="p-2.5 bg-red-950/30 border border-red-900/50 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-300 font-mono text-[11px]">{alert.title}</span>
                        <span className="px-1.5 py-0.2 text-[9px] bg-red-900/60 text-red-200 rounded font-mono">
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug">{alert.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* District Incidents & Road Lifelines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Active Incidents in District */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                  <FileSpreadsheet className="h-4 w-4 text-sky-400" />
                  <span>District Incident Feed</span>
                </div>
                <Link href="/reports" className="text-[10px] text-sky-400 font-mono">Moderation Queue</Link>
              </div>

              <div className="space-y-2">
                {districtIncidents.map((inc) => (
                  <div key={inc.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{inc.type} - {inc.location}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inc.district} • {inc.reportedTime} • Pop. Exposed: {inc.affectedPopulation}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {inc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked Roads & Detours */}
            <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-white uppercase">
                  <GitFork className="h-4 w-4 text-orange-400" />
                  <span>Highway Lifelines & Transit Bottlenecks</span>
                </div>
                <Link href="/roads" className="text-[10px] text-sky-400 font-mono">BRO Clearance</Link>
              </div>

              <div className="space-y-2">
                {districtRoads.map((road) => (
                  <div key={road.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{road.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Route: {road.route} ({road.totalLengthKm} km) • {road.blockedPointsCount} Chokepoint(s)
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      road.status === 'Completely Blocked' ? 'bg-red-950 text-red-300 border-red-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {road.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </MainLayout>
  );
}
