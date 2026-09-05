'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useEOC } from '@/context/EOCContext';
import { IncidentType, RiskLevel, ReporterType, NERState } from '@/types';
import { 
  Send, 
  MapPin, 
  Camera, 
  Video, 
  AlertTriangle, 
  CheckCircle2, 
  Compass, 
  Smartphone, 
  User, 
  Phone,
  FileText,
  UploadCloud,
  Navigation,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function FieldReportPage() {
  const { submitFieldReport } = useEOC();

  const [reporterType, setReporterType] = useState<ReporterType>('Citizen');
  const [reporterName, setReporterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [state, setState] = useState<NERState>('Sikkim');
  const [district, setDistrict] = useState('Pakyong');
  const [landmark, setLandmark] = useState('');
  const [hazardType, setHazardType] = useState<IncidentType>('Landslide');
  const [severity, setSeverity] = useState<RiskLevel>('HIGH');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState<number>(27.2345);
  const [lng, setLng] = useState<number>(88.5123);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);

  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(4)));
          setLng(Number(pos.coords.longitude.toFixed(4)));
        },
        () => {
          // fallback
          setLat(27.2345);
          setLng(88.5123);
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = submitFieldReport({
      reporterType,
      reporterName: reporterName || 'Anonymous Citizen Reporter',
      contactNumber: contactNumber || '+91-XXXXXXXXXX',
      district,
      state,
      landmark: landmark || `${hazardType} near ${district}`,
      lat,
      lng,
      hazardType,
      severity,
      description,
      photoUrl: photoName ? `/uploads/${photoName}` : undefined,
      videoUrl: videoName ? `/uploads/${videoName}` : undefined,
    });

    setSubmittedId(newId);
  };

  const handleReset = () => {
    setSubmittedId(null);
    setDescription('');
    setLandmark('');
    setPhotoName(null);
    setVideoName(null);
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-950/80 via-eoc-card to-slate-900 p-5 rounded-xl border border-amber-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-950 shrink-0">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black text-white font-mono tracking-wide">
                CITIZEN & FIELD OFFICER GROUND INCIDENT REPORTING PORTAL
              </h1>
              <p className="text-xs text-amber-200/80">
                Direct crowd-sourcing portal to report active landslides, tension cracks, rockfalls & road blockages
              </p>
            </div>
          </div>
        </div>

        {submittedId ? (
          /* Submission Success Card */
          <div className="bg-eoc-card border border-emerald-700/80 rounded-2xl p-8 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="inline-flex p-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 shadow-xl">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                Field Incident Report Successfully Dispatched!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your report has been securely transmitted to the State Disaster Management Authority (SDMA) & GSI Early Warning Command.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 max-w-sm mx-auto font-mono text-xs">
              <span className="text-slate-400 block mb-1">INCIDENT TRACKING ID:</span>
              <span className="text-xl font-black text-sky-400">{submittedId}</span>
              <div className="text-[10px] text-emerald-400 mt-1">Status: Pending Verification by EOC Scout</div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs"
              >
                Submit Another Report
              </button>
              <Link
                href="/reports"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-sky-950"
              >
                <FileText className="h-4 w-4" />
                <span>View in Verification Queue</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Main Submission Form */
          <form onSubmit={handleSubmit} className="bg-eoc-card border border-eoc-border rounded-xl p-6 shadow-2xl space-y-6 text-xs">
            {/* Step 1: Reporter Information */}
            <div className="space-y-3 border-b border-eoc-border pb-5">
              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase font-mono text-xs">
                <User className="h-4 w-4" />
                <span>1. Reporter Designation & Contact</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Reporter Role / Category
                  </label>
                  <select
                    value={reporterType}
                    onChange={(e) => setReporterType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                  >
                    <option value="Citizen">Local Citizen / Resident</option>
                    <option value="Field Officer">District Field Officer (ASDMA/SDMA)</option>
                    <option value="BRO Patrol">Border Roads Patrol Unit (BRO)</option>
                    <option value="NDRF Scout">NDRF / SDRF Search Scout</option>
                    <option value="Forest Guard">Forest Guard / Ranger</option>
                    <option value="Police Patrol">Highway Police Patrol</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Tenzing Norbu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mobile Contact Number
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91-98765-XXXXX"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Hazard Type & Urgency */}
            <div className="space-y-3 border-b border-eoc-border pb-5">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase font-mono text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>2. Hazard Category & Observed Severity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Observed Hazard Type
                  </label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="Landslide">Active Landslide (Mud / Debris Avalanche)</option>
                    <option value="Crack">Tension Crack on Hill Slope / Road</option>
                    <option value="Road Blockage">Highway Road Blockage / Sinking Zone</option>
                    <option value="Slope Movement">Slope Creep / Retaining Wall Bulge</option>
                    <option value="Flash Flood">Flash Flood / River Bank Scour</option>
                    <option value="Rockfall">Rockfall / Boulder Roll</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Estimated Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
                  >
                    <option value="CRITICAL">CRITICAL — Imminent Threat to Life / Highway Blocked</option>
                    <option value="HIGH">HIGH — Structural Damage / Partial Road Subsidence</option>
                    <option value="MODERATE">MODERATE — Warning Signs / Minor Mud Spills</option>
                    <option value="LOW">LOW — Surface Erosion / Minor Creep</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Location & Coordinates */}
            <div className="space-y-3 border-b border-eoc-border pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-bold uppercase font-mono text-xs">
                  <MapPin className="h-4 w-4" />
                  <span>3. Geographic Location & Coordinates</span>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-[11px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-2.5 py-1 rounded flex items-center gap-1 hover:bg-sky-900 transition-colors"
                >
                  <Navigation className="h-3 w-3" />
                  <span>Get My GPS Coordinates</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold"
                  >
                    <option value="Sikkim">Sikkim</option>
                    <option value="Assam">Assam</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Tripura">Tripura</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Pakyong, East Khasi Hills, Dima Hasao"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Specific Landmark, Highway Milestone or Village Name
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. NH-10 29th Mile, near Setipool Petrol Pump"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">LATITUDE (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">LONGITUDE (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Description & Media Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold uppercase font-mono text-xs">
                <Camera className="h-4 w-4" />
                <span>4. Incident Description & Visual Evidence</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detailed Field Observations
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe slope movement, size of debris slide, tension crack length/width, water seepage, or damage to buildings..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-900 p-3 rounded-lg border border-dashed border-slate-700 text-center space-y-1">
                  <Camera className="h-5 w-5 text-sky-400 mx-auto" />
                  <span className="text-slate-300 font-semibold block">Attach Landslide Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoName(e.target.files?.[0]?.name || null)}
                    className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-200"
                  />
                  {photoName && <span className="text-[10px] text-emerald-400 block">✓ {photoName}</span>}
                </div>

                <div className="bg-slate-900 p-3 rounded-lg border border-dashed border-slate-700 text-center space-y-1">
                  <Video className="h-5 w-5 text-purple-400 mx-auto" />
                  <span className="text-slate-300 font-semibold block">Attach Video Clip</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoName(e.target.files?.[0]?.name || null)}
                    className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:bg-slate-800 file:text-slate-200"
                  />
                  {videoName && <span className="text-[10px] text-emerald-400 block">✓ {videoName}</span>}
                </div>
              </div>
            </div>

            {/* Submission Action */}
            <div className="pt-4 border-t border-eoc-border flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                🔒 Data encrypted and routed to State EOC Command Center
              </span>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-xl shadow-amber-950 transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
                <span>Transmit Field Report Now</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
