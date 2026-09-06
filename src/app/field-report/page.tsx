'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  reportingService, 
  visionService, 
  ReportIncidentType, 
  ReportSeverity, 
  ReporterType, 
  VisionAnalysisResult,
  SAMPLE_DISASTER_PHOTOS 
} from '@/services/reporting';
import { useOfflineSync } from '@/services/offline';
import { useI18n } from '@/context/I18nContext';
import { 
  Send, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  Navigation, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  Eye, 
  Flame, 
  Clock, 
  Compass, 
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const NER_STATES_DISTRICTS: Record<string, string[]> = {
  'Sikkim': ['Pakyong', 'Gangtok', 'Mangan', 'Gyalshing', 'Namchi', 'Soreng'],
  'Meghalaya': ['East Khasi Hills', 'West Khasi Hills', 'Ri-Bhoi', 'West Jaintia Hills', 'East Garo Hills'],
  'Manipur': ['Noney', 'Tamenglong', 'Imphal West', 'Churachandpur', 'Senapati', 'Kangpokpi'],
  'Assam': ['Dima Hasao', 'Karbi Anglong', 'Cachar', 'Kamrup Metropolitan', 'Hailakandi'],
  'Arunachal Pradesh': ['West Kameng', 'Tawang', 'Papum Pare', 'East Siang', 'Lower Subansiri'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Mamit', 'Kolasib', 'Serchhip'],
  'Nagaland': ['Kohima', 'Chumukedima', 'Dimapur', 'Mokokchung', 'Wokha', 'Phek'],
  'Tripura': ['North Tripura', 'Dhalai', 'Unakoti', 'West Tripura', 'South Tripura'],
};

export default function FieldReportPage() {
  const { t } = useI18n();

  // Wizard current step: 1 to 6
  const [step, setStep] = useState<number>(1);

  // Form Fields
  const [incidentType, setIncidentType] = useState<ReportIncidentType>('Landslide');
  const [state, setState] = useState<string>('Sikkim');
  const [district, setDistrict] = useState<string>('Pakyong');
  const [village, setVillage] = useState<string>('Singtam Lower Bazaar');
  const [latitude, setLatitude] = useState<number>(27.2345);
  const [longitude, setLongitude] = useState<number>(88.5123);
  const [description, setDescription] = useState<string>('');
  const [roadBlocked, setRoadBlocked] = useState<boolean>(true);
  const [structuresAtRisk, setStructuresAtRisk] = useState<number>(2);
  const [severity, setSeverity] = useState<ReportSeverity>('HIGH');
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_DISASTER_PHOTOS[0].url);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [reporterType, setReporterType] = useState<ReporterType>('Citizen');
  const [reporterName, setReporterName] = useState<string>('Tashi Bhutia');
  const [contactPhone, setContactPhone] = useState<string>('+91 98451 22341');

  // AI Computer Vision State
  const [isAnalyzingVision, setIsAnalyzingVision] = useState<boolean>(false);
  const [visionResult, setVisionResult] = useState<VisionAnalysisResult | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);

  const incidentTypesList: { id: ReportIncidentType; label: string; icon: string; desc: string }[] = [
    { id: 'Landslide', label: t('fieldReport.types.landslide.label'), icon: '⛰️', desc: t('fieldReport.types.landslide.desc') },
    { id: 'Road Blockage', label: t('fieldReport.types.roadBlockage.label'), icon: '🚧', desc: t('fieldReport.types.roadBlockage.desc') },
    { id: 'Crack', label: t('fieldReport.types.crack.label'), icon: '⚡', desc: t('fieldReport.types.crack.desc') },
    { id: 'Slope Movement', label: t('fieldReport.types.slopeMovement.label'), icon: '📐', desc: t('fieldReport.types.slopeMovement.desc') },
    { id: 'Flood', label: t('fieldReport.types.flood.label'), icon: '🌊', desc: t('fieldReport.types.flood.desc') },
  ];

  const severityLevelsList: { id: ReportSeverity; label: string; color: string; bg: string; border: string; desc: string }[] = [
    { id: 'LOW', label: t('fieldReport.severities.LOW.label'), color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-800', desc: t('fieldReport.severities.LOW.desc') },
    { id: 'MODERATE', label: t('fieldReport.severities.MODERATE.label'), color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-800', desc: t('fieldReport.severities.MODERATE.desc') },
    { id: 'HIGH', label: t('fieldReport.severities.HIGH.label'), color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-800', desc: t('fieldReport.severities.HIGH.desc') },
    { id: 'CRITICAL', label: t('fieldReport.severities.CRITICAL.label'), color: 'text-red-400', bg: 'bg-red-950/60', border: 'border-red-700', desc: t('fieldReport.severities.CRITICAL.desc') },
  ];

  // Step 2: Handle GPS Locate Me
  const handleLocateMe = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
        },
        () => {
          setLatitude(27.2345);
          setLongitude(88.5123);
        }
      );
    }
  };

  // Step 5: Trigger AI Computer Vision Scan
  const handleRunAiVisionScan = async (selectedUrl?: string) => {
    setIsAnalyzingVision(true);
    try {
      const targetImg = selectedUrl || photoUrl;
      const res = await visionService.analyzeImage(targetImg, incidentType);
      setVisionResult(res);
      if (res.severity === 'CRITICAL') setSeverity('CRITICAL');
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const { enqueueReport, isOffline } = useOfflineSync();
  const [offlineQueuedReport, setOfflineQueuedReport] = useState<any | null>(null);

  // Step 6: Final Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reportPayload = {
      incidentType,
      description: description || `Reported ${incidentType} in ${village}, ${district}.`,
      severity,
      latitude,
      longitude,
      district,
      state,
      village,
      photoUrl,
      videoUrl: videoUrl || undefined,
      reporterType,
      reporterName: reporterName || 'Community Reporter',
      contactPhone,
      roadBlocked,
      structuresAtRisk,
      aiVisionAnalysis: visionResult || undefined,
    };

    if (isOffline) {
      const queued = enqueueReport(reportPayload);
      setOfflineQueuedReport(queued);
      setIsSubmitting(false);
      return;
    }

    try {
      const record = await reportingService.submitReport(reportPayload);
      setSubmittedReport(record);
    } catch (err) {
      console.warn('Network submission failed, falling back to local offline queue:', err);
      const queued = enqueueReport(reportPayload);
      setOfflineQueuedReport(queued);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedReport(null);
    setOfflineQueuedReport(null);
    setStep(1);
    setDescription('');
    setVisionResult(null);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-eoc-card p-4 md:p-5 rounded-xl border border-eoc-border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/80 shadow-inner">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                  {t('fieldReport.portalTitle')}
                </h1>
                <span className="bg-amber-900/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-700/50">
                  {t('nav.citizenSdrf')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t('fieldReport.portalSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/offline-queue"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Clock className="h-4 w-4 text-sky-400" />
              <span>{t('fieldReport.offlineQueueBtn')}</span>
            </Link>
            <Link
              href="/reports"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Eye className="h-4 w-4 text-slate-400" />
              <span>{t('fieldReport.adminQueueBtn')}</span>
            </Link>
          </div>
        </div>

        {/* OFFLINE SAVED CONFIRMATION SCREEN */}
        {offlineQueuedReport ? (
          <div className="bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 border border-amber-600/80 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-amber-950/90 text-amber-400 border border-amber-500 shadow-lg animate-pulse">
                <Clock className="h-10 w-10" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-amber-300 font-mono tracking-wide">
                {t('fieldReport.offlineSaved.title')}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {t('fieldReport.offlineSaved.subtitle')}
              </p>
            </div>

            {/* Incident Summary Card */}
            <div className="bg-slate-950/90 border border-amber-900/60 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">{t('fieldReport.offlineSaved.trackingId')}</span>
                  <span className="text-base font-black text-amber-400 tracking-wider">
                    {offlineQueuedReport.id}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">{t('fieldReport.offlineSaved.syncStatus')}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    {t('fieldReport.offlineSaved.statusQueued')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] block">{t('incidents.colType')}</span>
                  <span className="font-bold text-white font-sans">{offlineQueuedReport.incidentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">{t('incidents.colSeverity')}</span>
                  <span className={`font-bold ${offlineQueuedReport.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                    {offlineQueuedReport.severity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">{t('incidents.colLocation')}</span>
                  <span className="font-bold text-slate-200 font-sans truncate block">
                    {offlineQueuedReport.village}, {offlineQueuedReport.district}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/offline-queue"
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950"
              >
                <span>{t('fieldReport.offlineSaved.viewQueue')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold rounded-lg border border-slate-700 transition-all"
              >
                {t('fieldReport.offlineSaved.submitAnother')}
              </button>
            </div>
          </div>
        ) : submittedReport ? (
          <div className="bg-gradient-to-br from-slate-900 via-eoc-card to-slate-950 border border-emerald-600/60 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-600 shadow-lg">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-white font-mono tracking-wide">
                {t('fieldReport.onlineTransmitted.title')}
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                {t('fieldReport.onlineTransmitted.subtitle')}
              </p>
            </div>

            {/* Incident Summary Card */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">{t('fieldReport.onlineTransmitted.incidentId')}</span>
                  <span className="text-base font-black text-sky-400 tracking-wider">
                    {submittedReport.id}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">{t('fieldReport.onlineTransmitted.currentStatus')}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-700 font-bold">
                    <Clock className="h-3.5 w-3.5" />
                    {submittedReport.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] block">{t('incidents.colType')}</span>
                  <span className="font-bold text-white font-sans">{submittedReport.incidentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">{t('incidents.colSeverity')}</span>
                  <span className={`font-bold ${submittedReport.severity === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                    {submittedReport.severity}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">{t('incidents.colLocation')}</span>
                  <span className="font-bold text-slate-200 font-sans truncate block">
                    {submittedReport.village}, {submittedReport.district}
                  </span>
                </div>
              </div>

              {submittedReport.aiVisionAnalysis && (
                <div className="bg-purple-950/30 border border-purple-800/60 p-3 rounded-lg space-y-1 font-sans">
                  <div className="flex items-center gap-1.5 text-purple-300 font-mono text-[11px] font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>{t('fieldReport.onlineTransmitted.aiVerifiedIssue')}</span>
                  </div>
                  <p className="text-xs text-slate-200">
                    {submittedReport.aiVisionAnalysis.detectedIssue} ({(submittedReport.aiVisionAnalysis.confidence * 100).toFixed(0)}% {t('drawer.aiConfidence', { score: 100 }).split(':')[0]})
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/reports"
                className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-950"
              >
                <span>{t('fieldReport.onlineTransmitted.trackInQueue')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/map"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition-all"
              >
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                <span>{t('fieldReport.onlineTransmitted.viewOnMap')}</span>
              </Link>
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs rounded-lg transition-all"
              >
                {t('fieldReport.offlineSaved.submitAnother')}
              </button>
            </div>
          </div>
        ) : (
          /* 6-STEP MOBILE-FRIENDLY REPORTING WIZARD */
          <div className="bg-eoc-card border border-eoc-border rounded-xl p-5 md:p-6 shadow-2xl space-y-6">
            {/* Step Progress Tracker */}
            <div className="border-b border-eoc-border pb-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>{t('fieldReport.stepCount', { step })}</span>
                <span className="text-amber-400 font-bold">
                  {t(`fieldReport.steps.${step}`)}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-300"
                  style={{ width: `${(step / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* STEP 1: Select Incident Type */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {t('fieldReport.steps.1')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('fieldReport.portalSubtitle')}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {incidentTypesList.map((item) => {
                    const isSelected = incidentType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIncidentType(item.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/40 ring-1 ring-amber-500'
                            : 'bg-eoc-surface/60 border-eoc-border text-slate-300 hover:bg-eoc-surface hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div className="space-y-1">
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>{item.label}</span>
                            {isSelected && <Check className="h-4 w-4 text-amber-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Capture / Select Location */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {t('fieldReport.location.title')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('fieldReport.location.subtitle')}
                  </p>
                </div>

                {/* GPS Button */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Navigation className="h-5 w-5 text-sky-400 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold text-white font-mono block">{t('fieldReport.location.gpsTitle')}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Lat: {latitude.toFixed(4)}° N, Lng: {longitude.toFixed(4)}° E
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    className="px-3 py-1.5 bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-mono font-bold rounded-lg border border-sky-800 flex items-center gap-1.5 transition-all"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>{t('fieldReport.location.autoLocate')}</span>
                  </button>
                </div>

                {/* State & District Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">{t('fieldReport.location.state')}</label>
                    <select
                      value={state}
                      onChange={(e) => {
                        const nextState = e.target.value;
                        setState(nextState);
                        setDistrict(NER_STATES_DISTRICTS[nextState]?.[0] || '');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      {Object.keys(NER_STATES_DISTRICTS).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">{t('fieldReport.location.district')}</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      {(NER_STATES_DISTRICTS[state] || []).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Village / Landmark */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-semibold">{t('fieldReport.location.village')}</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Singtam Lower Bazaar, NH-10 29th Mile, Tupul Tunnel 12"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 font-sans text-xs"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: Add Description & Impact */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {t('fieldReport.description.title')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('fieldReport.description.subtitle')}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-300 font-semibold">{t('fieldReport.description.narrative')}</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('fieldReport.description.placeholder')}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-sans leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {/* Road Blocked Toggle */}
                  <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">{t('fieldReport.description.roadBlocked')}</span>
                      <span className="text-[11px] text-slate-400">{t('fieldReport.description.roadBlockedDesc')}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={roadBlocked}
                      onChange={(e) => setRoadBlocked(e.target.checked)}
                      className="h-5 w-5 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Structures at Risk */}
                  <div className="bg-eoc-surface p-3 rounded-lg border border-eoc-border flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">{t('fieldReport.description.structuresAtRisk')}</span>
                      <span className="text-[11px] text-slate-400">{t('fieldReport.description.structuresDesc')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setStructuresAtRisk(Math.max(0, structuresAtRisk - 1))}
                        className="px-2 py-1 bg-slate-800 text-white rounded font-mono font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-amber-400 text-sm px-2">
                        {structuresAtRisk}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStructuresAtRisk(structuresAtRisk + 1)}
                        className="px-2 py-1 bg-slate-800 text-white rounded font-mono font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Select Severity */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {t('fieldReport.steps.4')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('fieldReport.severities.CRITICAL.desc')}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {severityLevelsList.map((lvl) => {
                    const isSelected = severity === lvl.id;
                    return (
                      <div
                        key={lvl.id}
                        onClick={() => setSeverity(lvl.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? `${lvl.bg} ${lvl.border} ring-1 ring-amber-500 shadow-md`
                            : 'bg-eoc-surface/60 border-eoc-border hover:bg-eoc-surface'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${lvl.color}`}>
                            {lvl.id === 'CRITICAL' ? <Flame className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className={`font-mono font-bold text-xs ${lvl.color} block`}>
                              {lvl.label}
                            </span>
                            <span className="text-[11px] text-slate-300">{lvl.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-amber-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Photo / Video & AI Computer Vision Scan */}
            {step === 5 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {t('fieldReport.media.title')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('fieldReport.media.subtitle')}
                  </p>
                </div>

                {/* Sample Photo Pickers */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">
                    {t('fieldReport.media.samplePrompt')}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SAMPLE_DISASTER_PHOTOS.map((sp) => {
                      const isSelected = photoUrl === sp.url;
                      return (
                        <div
                          key={sp.id}
                          onClick={() => {
                            setPhotoUrl(sp.url);
                            handleRunAiVisionScan(sp.url);
                          }}
                          className={`cursor-pointer rounded-lg border overflow-hidden transition-all text-left ${
                            isSelected
                              ? 'border-amber-500 ring-2 ring-amber-500/50'
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img src={sp.url} alt={sp.name} className="h-20 w-full object-cover" />
                          <div className="p-2 bg-slate-950 text-[10px] space-y-0.5">
                            <span className="font-bold text-white font-mono block truncate">{sp.name}</span>
                            <span className="text-slate-400 block text-[9px] truncate">{sp.incidentType}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Vision Scan Action */}
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-bold text-white font-mono">
                      {t('fieldReport.media.aiScanTitle')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRunAiVisionScan()}
                    disabled={isAnalyzingVision}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzingVision ? 'animate-spin' : ''}`} />
                    <span>{isAnalyzingVision ? t('fieldReport.media.scanning') : t('fieldReport.media.runScan')}</span>
                  </button>
                </div>

                {/* AI Computer Vision Scan Result Display */}
                {visionResult && (
                  <div className="bg-gradient-to-br from-purple-950/40 via-slate-950 to-purple-950/20 border border-purple-800/80 rounded-xl p-4 shadow-xl space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between border-b border-purple-900/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-purple-900 text-purple-300 px-2 py-0.5 rounded uppercase font-bold">
                          {t('fieldReport.media.aiResultHeader')}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          {visionResult.detectedIssue}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-purple-300 font-bold">
                        {t('fieldReport.media.confidence', { score: (visionResult.confidence * 100).toFixed(0) })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono block">{t('fieldReport.media.observations')}</span>
                        <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
                          {visionResult.observations}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono block">{t('fieldReport.media.geotechnicalTags')}</span>
                        <div className="flex flex-wrap gap-1">
                          {visionResult.geotechnicalTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-900 text-sky-300 px-2 py-0.5 rounded border border-slate-800 font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 border-t border-purple-950 pt-2 flex items-center justify-between font-mono">
                      <span>{t('fieldReport.media.severityAssessment')} <b className="text-red-400">{visionResult.severity}</b></span>
                      <span>{new Date(visionResult.processedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Reporter Contact & Review */}
            {step === 6 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                    {t('fieldReport.review.title')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t('fieldReport.review.subtitle')}
                  </p>
                </div>

                {/* Reporter Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">{t('fieldReport.review.reporterRole')}</label>
                    <select
                      value={reporterType}
                      onChange={(e) => setReporterType(e.target.value as ReporterType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none"
                    >
                      <option value="Citizen">{t('fieldReport.review.roles.citizen')}</option>
                      <option value="Field Officer">{t('fieldReport.review.roles.fieldOfficer')}</option>
                      <option value="NDRF Scout">{t('fieldReport.review.roles.ndrfScout')}</option>
                      <option value="BRO Patrol">{t('fieldReport.review.roles.broPatrol')}</option>
                      <option value="Forest Guard">{t('fieldReport.review.roles.forestGuard')}</option>
                      <option value="Police Patrol">{t('fieldReport.review.roles.policePatrol')}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">{t('fieldReport.review.yourName')}</label>
                    <input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Tashi Bhutia"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-semibold">{t('fieldReport.review.phone')}</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98451 XXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Review Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                    {t('fieldReport.review.summaryTitle')}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{t('incidents.colType')}:</span>
                      <span className="text-white font-bold">{incidentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t('incidents.colSeverity')}:</span>
                      <span className="text-red-400 font-bold">{severity}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t('incidents.colLocation')}:</span>
                      <span className="text-slate-200 truncate block">{village}, {district}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t('emergency.colRoadStatus')}:</span>
                      <span className={roadBlocked ? 'text-red-400' : 'text-emerald-400'}>
                        {roadBlocked ? t('kpi.roadsBlocked') : t('common.active')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-eoc-border">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{t('fieldReport.review.prevStep')}</span>
                </button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-amber-950 transition-all active:scale-95"
                >
                  <span>{t('fieldReport.review.nextStep')}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-mono text-xs font-black rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all active:scale-95"
                >
                  <Send className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? t('fieldReport.review.submittingBtn') : t('fieldReport.review.submitBtn')}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
