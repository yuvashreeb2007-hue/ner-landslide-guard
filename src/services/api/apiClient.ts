/**
 * NER LandslideGuard - Full-stack API Client
 * Connects Next.js frontend to Python FastAPI AI Prediction Engine (http://localhost:8000)
 * Includes automated fallback to local geotechnical physics model if backend is unreachable.
 */

export interface PredictionInput {
  rainfall_24h: number;
  rainfall_7d: number;
  soil_moisture: number;
  slope: number;
  elevation: number;
  ndvi: number;
  historical_landslides: number;
  distance_to_road: number;
  distance_to_settlement: number;
  district?: string;
  state?: string;
  location_name?: string;
}

export interface PredictionResult {
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  contributing_factors: string[];
  factor_breakdown: Record<string, string>;
  recommended_action: string;
  geotechnical_details?: {
    factor_of_safety_est?: number;
    pore_pressure_ratio?: number;
    shear_stress_index?: number;
  };
  timestamp: string;
  source: 'fastapi_ml_engine' | 'client_physics_engine';
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Fallback analytical geotechnical calculation when backend server is starting or unreachable.
 */
function calculateClientSideFallback(input: PredictionInput): PredictionResult {
  const rad = (input.slope * Math.PI) / 180;
  const driving =
    Math.pow(Math.sin(rad), 1.6) * 45.0 +
    Math.pow(input.rainfall_24h / 150.0, 1.3) * 28.0 +
    Math.pow(input.rainfall_7d / 500.0, 1.1) * 18.0 +
    Math.pow(input.soil_moisture / 100.0, 1.8) * 32.0 +
    input.historical_landslides * 1.8 +
    (input.distance_to_road < 120 ? 14.0 * (1.0 - input.distance_to_road / 120.0) : 0);

  const resisting =
    input.ndvi * 24.0 +
    (1.0 - Math.sin(rad)) * 25.0 +
    (input.soil_moisture < 50 ? 20.0 * (1.0 - input.soil_moisture / 50.0) : 0) +
    15.0;

  const logit = (driving - resisting) / 12.0;
  const prob = 1.0 / (1.0 + Math.exp(-logit));
  const risk_score = Math.min(100, Math.max(0, Math.round(prob * 100)));
  const fos = Number((resisting / Math.max(driving, 0.01)).toFixed(2));

  let risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (risk_score > 80) risk_level = 'CRITICAL';
  else if (risk_score > 60) risk_level = 'HIGH';
  else if (risk_score > 30) risk_level = 'MODERATE';

  const contributing_factors: string[] = [];
  if (input.rainfall_24h >= 120) contributing_factors.push(`Extreme 24h monsoon rainfall (${input.rainfall_24h.toFixed(1)} mm)`);
  else if (input.rainfall_24h >= 65) contributing_factors.push(`Heavy 24h precipitation (${input.rainfall_24h.toFixed(1)} mm)`);

  if (input.soil_moisture >= 85) contributing_factors.push(`Critical soil moisture saturation (${input.soil_moisture.toFixed(1)}%)`);
  else if (input.soil_moisture >= 70) contributing_factors.push(`Elevated soil saturation (${input.soil_moisture.toFixed(1)}%)`);

  if (input.slope >= 45) contributing_factors.push(`Steep mountainous escarpment (${input.slope.toFixed(1)}° gradient)`);
  else if (input.slope >= 32) contributing_factors.push(`Moderate-to-steep hill slope (${input.slope.toFixed(1)}°)`);

  if (input.rainfall_7d >= 350) contributing_factors.push(`High 7-day antecedent saturation (${input.rainfall_7d.toFixed(1)} mm)`);
  if (input.historical_landslides >= 5) contributing_factors.push(`High historical recurrence (${input.historical_landslides} past events)`);
  if (input.distance_to_road < 100 && input.slope > 30) contributing_factors.push(`Highway toe undercutting vulnerability (${input.distance_to_road.toFixed(0)}m from road)`);
  if (input.ndvi < 0.30) contributing_factors.push(`Sparse vegetative cover / exposed topsoil (NDVI: ${input.ndvi.toFixed(2)})`);

  if (contributing_factors.length === 0) {
    contributing_factors.push('Stable geological and meteorological baseline conditions');
  }

  let recommended_action = '';
  if (risk_level === 'CRITICAL') {
    recommended_action = 'IMMEDIATE EVACUATION DIRECTIVE: Sound community siren alerts and evacuate settlements within 500m of slope base. Halt all transit along nearby road corridors.';
  } else if (risk_level === 'HIGH') {
    recommended_action = 'ORANGE ALERT - PRECAUTIONARY ACTION: Restrict night-time transit and heavy vehicular movement. Place emergency road clearance squads on active patrol.';
  } else if (risk_level === 'MODERATE') {
    recommended_action = 'YELLOW ADVISORY - ENHANCED VIGILANCE: Maintain continuous monitoring of automated rain gauges. Inspect roadside drainage culverts.';
  } else {
    recommended_action = 'GREEN NORMAL - STANDARD MONITORING: Normal baseline conditions. Continue periodic sensor telemetry logging.';
  }

  return {
    risk_score,
    risk_level,
    confidence: 0.91,
    contributing_factors,
    factor_breakdown: {
      rainfall_24h: input.rainfall_24h > 100 ? 'VERY HIGH' : input.rainfall_24h > 50 ? 'HIGH' : 'LOW',
      soil_moisture: input.soil_moisture > 80 ? 'VERY HIGH' : input.soil_moisture > 65 ? 'HIGH' : 'LOW',
      slope: input.slope > 45 ? 'VERY HIGH' : input.slope > 30 ? 'HIGH' : 'LOW',
      historical_landslides: input.historical_landslides > 6 ? 'HIGH' : 'LOW',
    },
    recommended_action,
    geotechnical_details: {
      factor_of_safety_est: fos,
      pore_pressure_ratio: Math.min(1.0, Number(((input.soil_moisture / 100) * (input.rainfall_24h / 200)).toFixed(3))),
      shear_stress_index: Number((Math.sin(rad) * (1 + input.soil_moisture / 100)).toFixed(3)),
    },
    timestamp: new Date().toISOString(),
    source: 'client_physics_engine',
  };
}

export const apiClient = {
  /**
   * Predict landslide risk by sending request to Python FastAPI ML Engine.
   */
  async predictRisk(input: PredictionInput): Promise<PredictionResult> {
    try {
      const res = await fetch(`${API_BASE}/predict-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(5000), // 5s timeout
      });

      if (!res.ok) {
        throw new Error(`FastAPI responded with status ${res.status}`);
      }

      const data = await res.json();
      return {
        ...data,
        source: 'fastapi_ml_engine',
      };
    } catch (err) {
      console.warn('[apiClient] FastAPI backend unavailable, utilizing client geotechnical engine:', err);
      return calculateClientSideFallback(input);
    }
  },

  /**
   * Check if FastAPI backend is online and operational.
   */
  async checkHealth(): Promise<{ online: boolean; info?: any }> {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const info = await res.json();
        return { online: true, info };
      }
      return { online: false };
    } catch {
      return { online: false };
    }
  },

  /**
   * Fetch Risk Zones from FastAPI backend
   */
  async getRiskZones(filters?: { district?: string; state?: string; level?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.district) params.append('district', filters.district);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.level) params.append('level', filters.level);

      const url = `${API_BASE}/risk-zones${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return await res.json();
      return null;
    } catch (err) {
      console.warn('[apiClient] Error fetching risk zones:', err);
      return null;
    }
  },

  /**
   * Submit citizen / field officer hazard report to backend
   */
  async submitReport(reportData: any) {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return await res.json();
      throw new Error(`Failed to submit: ${res.statusText}`);
    } catch (err) {
      console.warn('[apiClient] Error submitting field report:', err);
      throw err;
    }
  },

  /**
   * Fetch Active Weather Observations
   */
  async getWeather(district?: string) {
    try {
      const url = `${API_BASE}/weather${district ? '?district=' + encodeURIComponent(district) : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch Active Early Warning Bulletins
   */
  async getAlerts(level?: string) {
    try {
      const url = `${API_BASE}/alerts${level ? '?level=' + encodeURIComponent(level) : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Fetch Historical Incidents
   */
  async getIncidents(state?: string) {
    try {
      const url = `${API_BASE}/incidents${state ? '?state=' + encodeURIComponent(state) : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  },
};
