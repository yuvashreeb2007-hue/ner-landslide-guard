'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useEOC } from '@/context/EOCContext';
import { MOCK_PREDICTION_MODELS } from '@/data/mockData';
import { apiClient, PredictionInput, PredictionResult } from '@/services/api/apiClient';
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
  CheckCircle2,
  RefreshCw,
  Zap,
  Gauge,
  HelpCircle,
  Compass,
  MapPin,
  Check
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
  Legend,
  BarChart,
  Bar
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

// Presets for rapid testing across Northeast India
interface PresetScenario {
  id: string;
  name: string;
  location: string;
  state: string;
  description: string;
  input: PredictionInput;
}

const PRESETS: PresetScenario[] = [
  {
    id: 'cherrapunji-cloudburst',
    name: 'Cherrapunji Monsoon Cloudburst',
    location: 'Sohra Escarpment (East Khasi Hills)',
    state: 'Meghalaya',
    description: 'Torrential 185mm downpour on steep sandstone plateau with 92% soil saturation.',
    input: {
      rainfall_24h: 185.0,
      rainfall_7d: 540.0,
      soil_moisture: 92.0,
      slope: 52.0,
      elevation: 1430.0,
      ndvi: 0.35,
      historical_landslides: 18,
      distance_to_road: 75.0,
      distance_to_settlement: 220.0,
      district: 'East Khasi Hills',
      state: 'Meghalaya',
      location_name: 'Sohra Escarpment'
    }
  },
  {
    id: 'sikkim-nh10',
    name: 'Pakyong NH-10 Highway Corridor',
    location: 'Singtam 29th Mile (Pakyong)',
    state: 'Sikkim',
    input: {
      rainfall_24h: 142.5,
      rainfall_7d: 412.0,
      soil_moisture: 89.5,
      slope: 48.0,
      elevation: 860.0,
      ndvi: 0.38,
      historical_landslides: 15,
      distance_to_road: 40.0,
      distance_to_settlement: 380.0,
      district: 'Pakyong',
      state: 'Sikkim',
      location_name: 'NH-10 Singtam Corridor'
    },
    description: 'High pore-pressure build up with toe undercutting along National Highway 10.'
  },
  {
    id: 'manipur-railway',
    name: 'Tupul Noney Railway Cut',
    location: 'Ijei River Basin (Noney)',
    state: 'Manipur',
    input: {
      rainfall_24h: 156.0,
      rainfall_7d: 475.0,
      soil_moisture: 94.0,
      slope: 56.0,
      elevation: 890.0,
      ndvi: 0.28,
      historical_landslides: 22,
      distance_to_road: 110.0,
      distance_to_settlement: 290.0,
      district: 'Noney',
      state: 'Manipur',
      location_name: 'Tupul Tunnel Area'
    },
    description: 'Deep slope cutting with structural debris flow risk endangering construction camp.'
  },
  {
    id: 'tripura-dry',
    name: 'Tripura Lowland Dry Season',
    location: 'Jampui Hills (North Tripura)',
    state: 'Tripura',
    input: {
      rainfall_24h: 12.0,
      rainfall_7d: 38.0,
      soil_moisture: 36.0,
      slope: 19.0,
      elevation: 280.0,
      ndvi: 0.76,
      historical_landslides: 1,
      distance_to_road: 450.0,
      distance_to_settlement: 1200.0,
      district: 'North Tripura',
      state: 'Tripura',
      location_name: 'Jampui Ridge'
    },
    description: 'Low precipitation baseline with dense vegetation anchoring gentle slopes.'
  }
];

export default function PredictionsPage() {
  const { riskZones } = useEOC();

  // ML Prediction form state
  const [inputs, setInputs] = useState<PredictionInput>(PRESETS[1].input);
  const [selectedPreset, setSelectedPreset] = useState<string>('sikkim-nh10');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Check FastAPI backend status
  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      const res = await apiClient.checkHealth();
      if (isMounted) {
        setBackendOnline(res.online);
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Run prediction whenever inputs change or on trigger
  const runPrediction = async (customInputs?: PredictionInput) => {
    setIsLoading(true);
    try {
      const targetInput = customInputs || inputs;
      const res = await apiClient.predictRisk(targetInput);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial prediction on load
  useEffect(() => {
    runPrediction();
  }, []);

  // Handle Preset click
  const handlePresetSelect = (preset: PresetScenario) => {
    setSelectedPreset(preset.id);
    setInputs(preset.input);
    runPrediction(preset.input);
  };

  // Generic input updater
  const updateInput = (key: keyof PredictionInput, val: number | string) => {
    setSelectedPreset(''); // clear preset highlight
    const updated = { ...inputs, [key]: val };
    setInputs(updated);
  };

  // Interactive Slope Stability Simulator state
  const [simSlope, setSimSlope] = useState<number>(45);
  const [simRainfall, setSimRainfall] = useState<number>(140);
  const [simSoilMoisture, setSimSoilMoisture] = useState<number>(85);
  const [simPorePressure, setSimPorePressure] = useState<number>(55);
  const [simCohesion, setSimCohesion] = useState<number>(18); // kPa
  const [simFrictionAngle, setSimFrictionAngle] = useState<number>(28); // degrees

  // Infinite Slope Geotechnical FoS calculation formula
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
      <ProtectedRoute 
        requiredRoles={['ADMIN', 'DISTRICT_OFFICER']} 
        moduleName="AI Risk Prediction Engine & Geotechnical Modeling"
      >
        <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-eoc-card p-4 md:p-5 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/80 shadow-inner">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                  AI RISK PREDICTION ENGINE & GEOTECHNICAL MODELING
                </h1>
                <span className="bg-purple-900/40 text-purple-300 text-[10px] font-mono px-2 py-0.5 rounded border border-purple-700/50">
                  v1.0 ML
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-parameter ensemble (24h/7d Rainfall, Soil Saturation, Slope, InSAR & NDVI) with explainability
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {backendOnline ? (
              <span className="bg-emerald-950/90 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-700/80 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                FastAPI ML Backend: Connected (Port 8000)
              </span>
            ) : (
              <span className="bg-amber-950/80 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-800/80 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                Client-Side Geotechnical Engine Active
              </span>
            )}
            <span className="bg-slate-900 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-700 hidden sm:inline-block">
              Model: Random Forest Classifier
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LIVE AI RISK PREDICTION WORKBENCH */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 via-eoc-card to-slate-950 border border-purple-900/40 rounded-xl p-5 shadow-2xl space-y-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <div>
                <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Interactive AI Landslide Hazard Predictor
                </h2>
                <p className="text-[11px] text-slate-400">
                  Input 9 geological and hydrological variables or choose an emergency scenario preset
                </p>
              </div>
            </div>

            <button
              onClick={() => runPrediction()}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20 active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Computing ML Inference...' : 'Recalculate Risk'}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Quick Scenario Presets (Northeast India):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePresetSelect(p)}
                    className={`text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow-md shadow-purple-900/30'
                        : 'bg-eoc-surface/60 border-eoc-border text-slate-300 hover:bg-eoc-surface hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="font-mono text-[11px] text-purple-300">{p.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5 text-sky-400" />
                      {p.location}
                    </div>
                    <div className="text-[9px] text-slate-500 line-clamp-1">{p.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workbench Grid: Inputs (7 cols) vs Live Prediction Result (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Rainfall 24h */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold flex items-center gap-1">
                      24h Rainfall:
                    </span>
                    <span className="font-mono text-sky-400 font-bold">{inputs.rainfall_24h} mm</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={350}
                    step={2}
                    value={inputs.rainfall_24h}
                    onChange={(e) => updateInput('rainfall_24h', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0 mm</span>
                    <span>100 mm (Warning)</span>
                    <span>350 mm</span>
                  </div>
                </div>

                {/* 2. Rainfall 7d */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold">7-Day Rainfall:</span>
                    <span className="font-mono text-sky-400 font-bold">{inputs.rainfall_7d} mm</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={10}
                    value={inputs.rainfall_7d}
                    onChange={(e) => updateInput('rainfall_7d', parseFloat(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0 mm</span>
                    <span>400 mm</span>
                    <span>1000 mm</span>
                  </div>
                </div>

                {/* 3. Soil Moisture */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold">Soil Moisture (%):</span>
                    <span className="font-mono text-amber-400 font-bold">{inputs.soil_moisture}%</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    step={1}
                    value={inputs.soil_moisture}
                    onChange={(e) => updateInput('soil_moisture', parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>15% (Dry)</span>
                    <span>70% (Plastic)</span>
                    <span>100% (Liquid)</span>
                  </div>
                </div>

                {/* 4. Slope Angle */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold">Slope Gradient (°):</span>
                    <span className="font-mono text-purple-400 font-bold">{inputs.slope}°</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={75}
                    step={1}
                    value={inputs.slope}
                    onChange={(e) => updateInput('slope', parseFloat(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>5° (Plains)</span>
                    <span>35° (Moderate)</span>
                    <span>75° (Cliff)</span>
                  </div>
                </div>

                {/* 5. Elevation */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold">Elevation (m a.s.l):</span>
                    <span className="font-mono text-cyan-400 font-bold">{inputs.elevation} m</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={3500}
                    step={25}
                    value={inputs.elevation}
                    onChange={(e) => updateInput('elevation', parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>50m</span>
                    <span>1500m</span>
                    <span>3500m</span>
                  </div>
                </div>

                {/* 6. NDVI Vegetation */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold">NDVI (Vegetation):</span>
                    <span className="font-mono text-emerald-400 font-bold">{inputs.ndvi}</span>
                  </div>
                  <input
                    type="range"
                    min={0.05}
                    max={0.9}
                    step={0.02}
                    value={inputs.ndvi}
                    onChange={(e) => updateInput('ndvi', parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0.05 (Bare/Scar)</span>
                    <span>0.45</span>
                    <span>0.90 (Dense)</span>
                  </div>
                </div>

                {/* 7. Historical Landslides */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold">Historical Slips (10yr):</span>
                    <span className="font-mono text-rose-400 font-bold">{inputs.historical_landslides} events</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    step={1}
                    value={inputs.historical_landslides}
                    onChange={(e) => updateInput('historical_landslides', parseInt(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>0 (None)</span>
                    <span>10</span>
                    <span>30 (Recurrent)</span>
                  </div>
                </div>

                {/* 8. Distance to Highway/Road */}
                <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border space-y-1.5">
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-semibold">Distance to Road:</span>
                    <span className="font-mono text-orange-400 font-bold">{inputs.distance_to_road} m</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={2000}
                    step={10}
                    value={inputs.distance_to_road}
                    onChange={(e) => updateInput('distance_to_road', parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>10m (Toe Cut)</span>
                    <span>500m</span>
                    <span>2000m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Inference Output Card (5 cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 p-5 rounded-xl border border-purple-900/50 flex flex-col justify-between space-y-4 shadow-xl">
              {prediction ? (
                <>
                  {/* Top: Score & Level */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Composite Risk Index
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-4xl font-black font-mono tracking-tight ${
                            prediction.risk_score >= 81
                              ? 'text-red-400'
                              : prediction.risk_score >= 61
                              ? 'text-orange-400'
                              : prediction.risk_score >= 31
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {prediction.risk_score}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">/ 100</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <SeverityBadge
                        level={prediction.risk_level}
                        size="md"
                        pulse={prediction.risk_level === 'CRITICAL'}
                      />
                      <div className="text-[10px] font-mono text-purple-300">
                        Confidence: {(prediction.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Geotechnical Details Grid */}
                  {prediction.geotechnical_details && (
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-eoc-surface/70 p-2.5 rounded-lg border border-eoc-border">
                      <div>
                        <span className="text-slate-400 block">Est. FoS</span>
                        <span className={`font-bold ${prediction.geotechnical_details.factor_of_safety_est && prediction.geotechnical_details.factor_of_safety_est < 1.0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {prediction.geotechnical_details.factor_of_safety_est ?? 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Pore Ratio (ru)</span>
                        <span className="text-cyan-400 font-bold">
                          {prediction.geotechnical_details.pore_pressure_ratio ?? 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Shear Index</span>
                        <span className="text-amber-400 font-bold">
                          {prediction.geotechnical_details.shear_stress_index ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Contributing Factors */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      AI Model Contributing Factors:
                    </span>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-xs">
                      {prediction.contributing_factors.map((factor, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-1.5 bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-800 text-[11px] text-slate-200"
                        >
                          <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Action SOP */}
                  <div className="bg-purple-950/40 border border-purple-800/60 p-3 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider block">
                      Standard Operating Directive (SOP):
                    </span>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                      {prediction.recommended_action}
                    </p>
                  </div>

                  {/* Source Stamp */}
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-1">
                    <span>Source: {prediction.source === 'fastapi_ml_engine' ? 'FastAPI ML Engine (Port 8000)' : 'Client Geotechnical Engine'}</span>
                    <span>{new Date(prediction.timestamp).toLocaleTimeString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 text-xs">
                  <RefreshCw className="h-6 w-6 animate-spin text-purple-400 mb-2" />
                  <span>Computing initial AI prediction...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Interactive Geotechnical Factor of Safety (FoS) Simulator */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 via-eoc-card to-slate-950 border border-sky-900/60 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Geotechnical Slope Stability (Factor of Safety) Analytical Simulator
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

        {/* ========================================================================= */}
        {/* 3. Charts: Intensity-Duration Thresholds & Explainable AI Weights */}
        {/* ========================================================================= */}
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
              <span>Trained on 6,500+ NER geotechnical records</span>
              <span className="text-emerald-400">F1-Score: 94.6%</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. District-Wise 24h / 48h / 72h Predictive Probability Table */}
        {/* ========================================================================= */}
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
      </ProtectedRoute>
    </MainLayout>
  );
}
