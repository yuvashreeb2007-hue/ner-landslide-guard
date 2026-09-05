'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { MOCK_PREDICTION_MODELS } from '@/data/mockData';
import { 
  Cpu, 
  Sparkles, 
  Sliders, 
  Activity, 
  AlertTriangle, 
  Layers, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { SeverityBadge } from '@/components/common/SeverityBadge';

// Empirical Intensity-Duration curve points
const ID_THRESHOLD_DATA = [
  { durationHours: 1, rainfallMm: 45, thresholdMm: 35, eventStatus: 'Critical' },
  { durationHours: 3, rainfallMm: 85, thresholdMm: 62, eventStatus: 'Critical' },
  { durationHours: 6, rainfallMm: 120, thresholdMm: 95, eventStatus: 'Critical' },
  { durationHours: 12, rainfallMm: 155, thresholdMm: 130, eventStatus: 'Critical' },
  { durationHours: 24, rainfallMm: 178, thresholdMm: 160, eventStatus: 'Critical' },
  { durationHours: 48, rainfallMm: 240, thresholdMm: 210, eventStatus: 'Critical' },
  { durationHours: 72, rainfallMm: 290, thresholdMm: 260, eventStatus: 'Critical' },
];

export default function PredictionsPage() {
  const { riskZones } = useEOC();

  // Interactive Slope Stability Simulator state
  const [simSlope, setSimSlope] = useState<number>(45);
  const [simRainfall, setSimRainfall] = useState<number>(140);
  const [simSoilMoisture, setSimSoilMoisture] = useState<number>(85);
  const [simPorePressure, setSimPorePressure] = useState<number>(55);
  const [simCohesion, setSimCohesion] = useState<number>(18); // kPa
  const [simFrictionAngle, setSimFrictionAngle] = useState<number>(28); // degrees

  // Infinite Slope Geotechnical FoS calculation formula
  // FoS = (c' + (gamma*z*cos^2(beta) - u) * tan(phi')) / (gamma*z*sin(beta)*cos(beta))
  const calculateFoS = () => {
    const betaRad = (simSlope * Math.PI) / 180;
    const phiRad = (simFrictionAngle * Math.PI) / 180;
    const gamma = 19; // kN/m3
    const z = 4.5; // depth in meters
    const u = simPorePressure; // pore pressure

    const normalStress = gamma * z * Math.pow(Math.cos(betaRad), 2);
    const effectiveNormalStress = Math.max(0.1, normalStress - u);
    const shearStrength = simCohesion + effectiveNormalStress * Math.tan(phiRad);
    const shearStress = gamma * z * Math.sin(betaRad) * Math.cos(betaRad);

    const fos = Math.max(0.4, Number((shearStrength / Math.max(0.1, shearStress)).toFixed(2)));
    return fos;
  };

  const currentFoS = calculateFoS();
  const simRiskLevel = currentFoS < 1.0 ? 'CRITICAL' : currentFoS < 1.3 ? 'HIGH' : currentFoS < 1.5 ? 'MODERATE' : 'LOW';

  return (
    <MainLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-eoc-card p-4 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-950 text-purple-400 border border-purple-800">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                AI RISK PREDICTIONS & GEOTECHNICAL MODELING
              </h1>
              <p className="text-xs text-slate-400">
                LSTM-Runoff forecasting, Infinite Slope Factor of Safety (FoS) & GSI Intensity-Duration thresholds
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              ML Ensemble Accuracy: 94.6%
            </span>
          </div>
        </div>

        {/* 1. Interactive Geotechnical Factor of Safety (FoS) Simulator */}
        <div className="bg-gradient-to-br from-slate-900 via-eoc-card to-slate-950 border border-sky-900/60 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Interactive Geotechnical Slope Stability (Factor of Safety) Simulator
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Calculated State:</span>
              <SeverityBadge level={simRiskLevel} size="md" pulse={simRiskLevel === 'CRITICAL'} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Sliders (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 bg-eoc-surface p-3 rounded-lg border border-eoc-border">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Slope Angle (Gradient):</span>
                  <span className="font-mono text-sky-400">{simSlope}°</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={65}
                  value={simSlope}
                  onChange={(e) => setSimSlope(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>15° (Gentle)</span>
                  <span>45° (Steep)</span>
                  <span>65° (Cliff)</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-eoc-surface p-3 rounded-lg border border-eoc-border">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>24h Rainfall Infiltration:</span>
                  <span className="font-mono text-sky-400">{simRainfall} mm</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={300}
                  value={simRainfall}
                  onChange={(e) => setSimRainfall(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 mm</span>
                  <span>150 mm (Heavy)</span>
                  <span>300 mm (Extreme)</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-eoc-surface p-3 rounded-lg border border-eoc-border">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Pore Water Pressure (u):</span>
                  <span className="font-mono text-cyan-400">{simPorePressure} kPa</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={simPorePressure}
                  onChange={(e) => setSimPorePressure(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0 kPa (Dry)</span>
                  <span>50 kPa (Critical)</span>
                  <span>100 kPa</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-eoc-surface p-3 rounded-lg border border-eoc-border">
                <div className="flex justify-between font-semibold text-slate-200">
                  <span>Soil Moisture Saturation:</span>
                  <span className="font-mono text-amber-400">{simSoilMoisture} %</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={100}
                  value={simSoilMoisture}
                  onChange={(e) => setSimSoilMoisture(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>30%</span>
                  <span>75% (Plastic)</span>
                  <span>100% (Liquid)</span>
                </div>
              </div>
            </div>

            {/* Gauge Display (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Factor of Safety (FoS) Index
              </span>
              <div
                className={`text-4xl font-black font-mono tracking-tight ${
                  currentFoS < 1.0
                    ? 'text-red-400 animate-pulse'
                    : currentFoS < 1.3
                    ? 'text-orange-400'
                    : 'text-emerald-400'
                }`}
              >
                {currentFoS}
              </div>
              <div className="text-xs font-bold text-slate-200">
                {currentFoS < 1.0
                  ? '⚠️ FAILURE IMMINENT (Shear stress exceeds shear strength)'
                  : currentFoS < 1.3
                  ? '⚡ HIGH VULNERABILITY (Critical threshold zone)'
                  : '✅ STABLE EQUILIBRIUM'}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Mohr-Coulomb Failure Criteria: &tau; = c&apos; + (&sigma; - u) tan(&phi;&apos;)
              </p>
            </div>
          </div>
        </div>

        {/* 2. Charts: Intensity-Duration Thresholds & Explainable AI Weights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* I-D Curve */}
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
            <div className="border-b border-eoc-border pb-2.5 mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  GSI CAINE INTENSITY-DURATION (I-D) THRESHOLD CURVE
                </h3>
                <p className="text-[10px] text-slate-400">
                  Precipitation duration vs critical landslide trigger boundary
                </p>
              </div>
              <span className="text-[10px] font-mono bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800">
                Surpassed
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ID_THRESHOLD_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2f4a" />
                  <XAxis dataKey="durationHours" name="Duration (hrs)" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e1726',
                      borderColor: '#1e2f4a',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area
                    type="monotone"
                    dataKey="rainfallMm"
                    name="Current Observed Rainfall (mm)"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="thresholdMm"
                    name="Empirical Trigger Threshold (mm)"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Explainable AI SHAP Weights */}
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
            <div className="border-b border-eoc-border pb-2.5 mb-3">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                SHAPLEY FEATURE IMPORTANCE (AI MODEL EXPLAINABILITY)
              </h3>
              <p className="text-[10px] text-slate-400">
                Relative contribution weight of input features to landslide probability
              </p>
            </div>

            <div className="space-y-3 py-1">
              {MOCK_PREDICTION_MODELS[0].featuresUsed.map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{feat.name}</span>
                    <span className="font-mono text-sky-400 font-bold">
                      {(feat.importanceWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        idx === 0
                          ? 'bg-gradient-to-r from-red-600 to-red-400'
                          : idx === 1
                          ? 'bg-gradient-to-r from-orange-600 to-orange-400'
                          : idx === 2
                          ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                          : 'bg-gradient-to-r from-sky-600 to-sky-400'
                      }`}
                      style={{ width: `${feat.importanceWeight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-eoc-border text-[10px] text-slate-400 flex items-center justify-between font-mono">
              <span>Trained on 148,200 NER geotechnical records</span>
              <span className="text-emerald-400">F1-Score: 94.4%</span>
            </div>
          </div>
        </div>

        {/* 3. District-Wise 24h / 48h / 72h Predictive Probability Table */}
        <div className="bg-eoc-card border border-eoc-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-eoc-border pb-2.5">
            <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
              NORTHEAST INDIA 72-HOUR DISTRICT HAZARD PROBABILITY FORECAST
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Updated Hourly via IMD-GSI Ensemble</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">District</th>
                  <th className="p-2.5">State</th>
                  <th className="p-2.5">24h Failure Prob</th>
                  <th className="p-2.5">48h Failure Prob</th>
                  <th className="p-2.5">72h Failure Prob</th>
                  <th className="p-2.5">Primary Geotechnical Concern</th>
                  <th className="p-2.5">Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {riskZones.map((z) => {
                  const p24 = z.riskScore;
                  const p48 = Math.min(99, Math.round(z.riskScore * 1.05));
                  const p72 = Math.min(99, Math.round(z.riskScore * 1.02));

                  return (
                    <tr key={z.id} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-bold text-white font-sans">{z.district}</td>
                      <td className="p-2.5 text-slate-400">{z.state}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${p24 >= 85 ? 'bg-red-950 text-red-400' : 'bg-orange-950 text-orange-400'}`}>
                          {p24}%
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${p48 >= 85 ? 'bg-red-950 text-red-400' : 'bg-orange-950 text-orange-400'}`}>
                          {p48}%
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${p72 >= 85 ? 'bg-red-950 text-red-400' : 'bg-orange-950 text-orange-400'}`}>
                          {p72}%
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-300 font-sans text-[11px] max-w-xs truncate">
                        {z.riskExplanation.geologicalFormation}
                      </td>
                      <td className="p-2.5 font-sans">
                        <SeverityBadge level={z.riskLevel} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
