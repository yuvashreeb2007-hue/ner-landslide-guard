/**
 * Alert Service for NER LandslideGuard
 * Manages active alerts, alert history, automated rules evaluation, multi-channel dispatch,
 * and command center lifecycle actions (Acknowledge, Escalate, Dispatch).
 */

import {
  AlertObject,
  AlertSeverity,
  AlertStatus,
  RuleEvaluationInput,
} from './types';
import { alertRulesEngine } from './AlertRulesEngine';
import { notificationManager } from './notifications/NotificationManager';

const INITIAL_ALERTS: AlertObject[] = [
  {
    id: 'ALT-2026-SK-CRIT-01',
    severity: 'CRITICAL',
    title: 'CRITICAL LANDSLIDE WARNING: Immediate Slope Failure Threat in Pakyong',
    district: 'Pakyong',
    state: 'Sikkim',
    location: 'Singtam 29th Mile Retaining Wall, NH-10 Corridor',
    latitude: 27.2341,
    longitude: 88.4892,
    message: 'Catastrophic landslide risk detected for Singtam 29th Mile. Inclinometers indicate 4.8° angular displacement with 184mm continuous 24h rainfall exceeding critical saturation.',
    reason: 'Composite AI landslide risk score is critical (94/100). Active IoT sensor alarm: Slope Tilt (4.8° vs safety limit 3.5°), Ground Movement (14.2mm vs safety limit 10mm). Extreme 24h precipitation (184.2 mm) exceeding cloudburst saturation limit. 2 verified field reports confirm ground fissuring and retaining wall fracture.',
    createdAt: '10 Mins Ago (10:45 IST)',
    validUntil: 'Next 12 Hours',
    affectedPopulation: 14800,
    recommendedAction: 'Mandatory preventive evacuation to designated community shelters in Singtam High School Ground. Total highway curfew on NH-10. Mobilize NDRF 2nd Battalion and SDRF Sikkim.',
    status: 'ACTIVE',
    triggerRules: [
      'RULE-01-CRIT-RISK (Risk Score >= 80)',
      'RULE-03-EXTREME-RAIN (24h Rainfall > 120mm)',
      'RULE-05-SOIL-SATURATION (Soil Moisture >= 85%)',
      'RULE-06-SENSOR-CRITICAL (Slope Tilt > 3.5°)',
      'RULE-07-VERIFIED-REPORT-BOOST (2 Verified Reports)',
    ],
    telemetrySnapshot: {
      riskScore: 94,
      rainfall24h: 184.2,
      rainfall7d: 312.0,
      soilMoisture: 91.5,
      slope: 38.4,
      elevation: 780,
      criticalSensorTriggered: true,
      sensorTriggers: ['SEN-SK-SM-01 (Slope Tilt 4.8°)', 'SEN-SK-GM-02 (Crackmeter 14.2mm)'],
      verifiedReportsCount: 2,
      historicalLandslideCount: 8,
    },
    deliveryLog: [
      {
        channel: 'APP',
        providerName: 'In-App EOC Command Feed',
        status: 'DELIVERED',
        timestamp: '10:45:12 IST',
        recipientCount: 42,
        latencyMs: 38,
        details: 'Dispatched to SDMA & District EOC command consoles',
      },
      {
        channel: 'SMS',
        providerName: 'Cell-Broadcast & Telecom SMS Gateway',
        status: 'DELIVERED',
        timestamp: '10:45:13 IST',
        recipientCount: 13024,
        latencyMs: 182,
        details: 'Geo-fenced SMS broadcast sent to Pakyong mobile BTS towers',
      },
      {
        channel: 'PUSH',
        providerName: 'Web Push & Mobile FCM Gateway',
        status: 'DELIVERED',
        timestamp: '10:45:13 IST',
        recipientCount: 9176,
        latencyMs: 124,
        details: 'High-priority FCM payload with loud alert tone',
      },
    ],
  },
  {
    id: 'ALT-2026-MG-DANG-02',
    severity: 'DANGER',
    title: 'DANGER ADVISORY: Severe Slope Destabilization & Mudflow in East Khasi Hills',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    location: 'Mawkdok Bridge - Sohra Escarpment, SH-5',
    latitude: 25.352,
    longitude: 91.734,
    message: 'High likelihood of mudflow inundation and lateral embankment failure along Mawkdok Gorge.',
    reason: 'Composite AI risk score high (78/100). Heavy 24h precipitation (142.5 mm) acting on steep gorge slope (42.0°). Critical soil saturation (88.4%) with high hydrostatic pore pressure.',
    createdAt: '25 Mins Ago (10:30 IST)',
    validUntil: 'Next 18 Hours',
    affectedPopulation: 8500,
    recommendedAction: 'Issue pre-evacuation alert to valley households. Restrict non-emergency transit on Mawkdok-Sohra road. Activate Block Development Officer emergency response cell.',
    status: 'ACTIVE',
    triggerRules: [
      'RULE-02-WARN-RISK (Risk Score >= 60)',
      'RULE-03-EXTREME-RAIN (24h Rainfall > 120mm)',
      'RULE-05-SOIL-SATURATION (Soil Moisture >= 85%)',
    ],
    telemetrySnapshot: {
      riskScore: 78,
      rainfall24h: 142.5,
      rainfall7d: 285.0,
      soilMoisture: 88.4,
      slope: 42.0,
      elevation: 1250,
      criticalSensorTriggered: false,
      sensorTriggers: [],
      verifiedReportsCount: 1,
      historicalLandslideCount: 5,
    },
    deliveryLog: [
      {
        channel: 'APP',
        providerName: 'In-App EOC Command Feed',
        status: 'DELIVERED',
        timestamp: '10:30:05 IST',
        recipientCount: 31,
        latencyMs: 44,
      },
      {
        channel: 'SMS',
        providerName: 'Cell-Broadcast & Telecom SMS Gateway',
        status: 'DELIVERED',
        timestamp: '10:30:06 IST',
        recipientCount: 7480,
        latencyMs: 195,
      },
      {
        channel: 'PUSH',
        providerName: 'Web Push & Mobile FCM Gateway',
        status: 'DELIVERED',
        timestamp: '10:30:06 IST',
        recipientCount: 5270,
        latencyMs: 135,
      },
    ],
  },
  {
    id: 'ALT-2026-AS-WARN-03',
    severity: 'WARNING',
    title: 'LANDSLIDE WARNING: Heavy Rainfall & Elevated Risk in Dima Hasao',
    district: 'Dima Hasao',
    state: 'Assam',
    location: 'Jatinga - Haflong Hill Section, NH-27 & Lumding Railway Link',
    latitude: 25.123,
    longitude: 92.981,
    message: 'Sustained monsoon showers have elevated risk of cutting-slope collapse along railway track formation.',
    reason: 'Risk score elevated (68/100). Heavy 24h rainfall (86.0 mm) on saturated clay-shale stratum. Soil moisture at 82.0%.',
    createdAt: '1 Hour Ago (09:50 IST)',
    validUntil: 'Next 24 Hours',
    affectedPopulation: 5200,
    recommendedAction: 'Advise residents to avoid steep cut-slopes and stream gullies. Put NF Railway track inspection units and earthmoving machinery on standby.',
    status: 'ACTIVE',
    triggerRules: [
      'RULE-02-WARN-RISK (Risk Score >= 60)',
      'RULE-04-HIGH-RAIN (24h Rainfall > 70mm on Steep Slope)',
    ],
    telemetrySnapshot: {
      riskScore: 68,
      rainfall24h: 86.0,
      rainfall7d: 195.0,
      soilMoisture: 82.0,
      slope: 29.5,
      elevation: 640,
      criticalSensorTriggered: false,
      sensorTriggers: [],
      verifiedReportsCount: 0,
      historicalLandslideCount: 6,
    },
    deliveryLog: [
      {
        channel: 'APP',
        providerName: 'In-App EOC Command Feed',
        status: 'DELIVERED',
        timestamp: '09:50:15 IST',
        recipientCount: 22,
        latencyMs: 40,
      },
      {
        channel: 'SMS',
        providerName: 'Cell-Broadcast & Telecom SMS Gateway',
        status: 'DELIVERED',
        timestamp: '09:50:16 IST',
        recipientCount: 4576,
        latencyMs: 210,
      },
      {
        channel: 'PUSH',
        providerName: 'Web Push & Mobile FCM Gateway',
        status: 'DELIVERED',
        timestamp: '09:50:16 IST',
        recipientCount: 3224,
        latencyMs: 140,
      },
    ],
  },
  {
    id: 'ALT-2026-MN-WATCH-04',
    severity: 'WATCH',
    title: 'LANDSLIDE WATCH: Saturated Soil & Moderate Vulnerability in Noney',
    district: 'Noney',
    state: 'Manipur',
    location: 'Tupul Railway Construction Corridor & NH-37',
    latitude: 24.812,
    longitude: 93.654,
    message: 'Weather stations report persistent rainfall with rising moisture saturation in Ijei river catchment.',
    reason: 'Moderate risk index (54/100). Saturated ground from 48h persistent monsoon drizzle. Piezometer indicates rising groundwater table.',
    createdAt: '2 Hours Ago (08:45 IST)',
    validUntil: 'Next 36 Hours',
    affectedPopulation: 2900,
    recommendedAction: 'Monitor live IoT sensor telemetry. Restrict non-essential heavy transport on mountain corridors. Maintain daily communication with local village disaster management committees.',
    status: 'ACTIVE',
    triggerRules: ['RULE-04-HIGH-RAIN (24h Rainfall > 70mm on Steep Slope)'],
    telemetrySnapshot: {
      riskScore: 54,
      rainfall24h: 72.0,
      rainfall7d: 145.0,
      soilMoisture: 76.5,
      slope: 31.0,
      elevation: 520,
      criticalSensorTriggered: false,
      sensorTriggers: [],
      verifiedReportsCount: 0,
      historicalLandslideCount: 4,
    },
    deliveryLog: [
      {
        channel: 'APP',
        providerName: 'In-App EOC Command Feed',
        status: 'DELIVERED',
        timestamp: '08:45:05 IST',
        recipientCount: 18,
        latencyMs: 42,
      },
      {
        channel: 'SMS',
        providerName: 'Cell-Broadcast & Telecom SMS Gateway',
        status: 'DELIVERED',
        timestamp: '08:45:06 IST',
        recipientCount: 2552,
        latencyMs: 205,
      },
      {
        channel: 'PUSH',
        providerName: 'Web Push & Mobile FCM Gateway',
        status: 'DELIVERED',
        timestamp: '08:45:06 IST',
        recipientCount: 1798,
        latencyMs: 130,
      },
    ],
  },
  {
    id: 'ALT-2026-AR-HIST-05',
    severity: 'CRITICAL',
    title: 'CRITICAL LANDSLIDE WARNING: Rockfall & Debris Inundation in West Kameng',
    district: 'West Kameng',
    state: 'Arunachal Pradesh',
    location: 'Bhalukpong - Tenga Valley Road, NH-13',
    latitude: 27.21,
    longitude: 92.54,
    message: 'Massive rockfall triggered by continuous cloudburst precipitation (>175mm). Carriageway blocked.',
    reason: 'Extreme rainfall surge with slope shear failure. Project Vartak BRO heavy machinery deployed.',
    createdAt: 'Yesterday (18:20 IST)',
    validUntil: 'Expired',
    affectedPopulation: 6200,
    recommendedAction: 'Total vehicular diversion via alternate Tezpur-Bomdila route. NDRF clearance.',
    status: 'RESOLVED',
    triggerRules: [
      'RULE-01-CRIT-RISK (Risk Score >= 80)',
      'RULE-03-EXTREME-RAIN (24h Rainfall > 120mm)',
    ],
    telemetrySnapshot: {
      riskScore: 89,
      rainfall24h: 175.0,
      soilMoisture: 89.0,
      slope: 41.5,
      criticalSensorTriggered: true,
      sensorTriggers: ['SEN-AR-RT-01 (Slope Tilt 5.2°)'],
      verifiedReportsCount: 3,
    },
    deliveryLog: [
      {
        channel: 'APP',
        providerName: 'In-App EOC Command Feed',
        status: 'DELIVERED',
        timestamp: '18:20:10 IST',
        recipientCount: 45,
        latencyMs: 35,
      },
      {
        channel: 'SMS',
        providerName: 'Cell-Broadcast & Telecom SMS Gateway',
        status: 'DELIVERED',
        timestamp: '18:20:11 IST',
        recipientCount: 5456,
        latencyMs: 190,
      },
      {
        channel: 'PUSH',
        providerName: 'Web Push & Mobile FCM Gateway',
        status: 'DELIVERED',
        timestamp: '18:20:11 IST',
        recipientCount: 3844,
        latencyMs: 120,
      },
    ],
    acknowledgedBy: 'Duty Officer (SEOC Itanagar)',
    acknowledgedAt: 'Yesterday 18:25 IST',
    dispatchedTeams: ['NDRF 12th Bn Unit B', 'BRO Project Vartak Team 4'],
    dispatchedAt: 'Yesterday 18:32 IST',
    resolvedAt: 'Today 06:00 IST',
    resolutionNote: 'Debris completely cleared by BRO bulldozers. Single-lane traffic restored under police supervision.',
  },
];

export class AlertService {
  private alerts: AlertObject[] = [...INITIAL_ALERTS];
  private listeners: Set<() => void> = new Set();

  public getAlerts(): AlertObject[] {
    return [...this.alerts];
  }

  public getActiveAlerts(): AlertObject[] {
    return this.alerts.filter((a) => a.status !== 'RESOLVED');
  }

  public getAlertHistory(): AlertObject[] {
    return this.alerts.filter((a) => a.status === 'RESOLVED' || a.status === 'ACKNOWLEDGED' || a.status === 'DISPATCHED');
  }

  public getAlertById(id: string): AlertObject | undefined {
    return this.alerts.find((a) => a.id === id);
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Error notifying alert listener:', e);
      }
    });
  }

  /**
   * Runs the rules engine evaluation on a given set of parameters and triggers a new alert if applicable
   */
  public async evaluateAndTriggerAlert(input: RuleEvaluationInput): Promise<AlertObject | null> {
    const evaluation = alertRulesEngine.evaluate(input);

    if (!evaluation.triggered) {
      return null;
    }

    const newId = `ALT-2026-${input.state.slice(0, 2).toUpperCase()}-${evaluation.severity.slice(0, 4)}-0${Math.floor(10 + Math.random() * 90)}`;
    const nowIst = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    const newAlert: AlertObject = {
      id: newId,
      severity: evaluation.severity,
      title: evaluation.title,
      district: input.district,
      state: input.state,
      location: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
      message: evaluation.message,
      reason: evaluation.reason,
      createdAt: `Just now (${nowIst})`,
      validUntil: evaluation.severity === 'CRITICAL' ? 'Next 12 Hours' : 'Next 24 Hours',
      affectedPopulation: evaluation.affectedPopulation,
      recommendedAction: evaluation.recommendedAction,
      status: 'ACTIVE',
      triggerRules: evaluation.matchedRules,
      telemetrySnapshot: {
        riskScore: input.riskScore,
        rainfall24h: input.rainfall24h,
        rainfall7d: input.rainfall7d,
        soilMoisture: input.soilMoisture,
        slope: input.slope,
        elevation: input.elevation,
        criticalSensorTriggered: !!input.criticalSensorTriggered,
        sensorTriggers: input.sensorDetails?.filter((s) => s.status === 'CRITICAL').map((s) => `${s.id} (${s.type}: ${s.value})`) || [],
        verifiedReportsCount: input.verifiedFieldReportsCount || 0,
        historicalLandslideCount: input.historicalActivityCount || 0,
      },
      deliveryLog: [],
    };

    // Broadcast in background via multi-channel notification providers
    const deliveryLogs = await notificationManager.broadcastAlert(newAlert);
    newAlert.deliveryLog = deliveryLogs;

    // Add to state at top
    this.alerts = [newAlert, ...this.alerts];
    this.notifyListeners();

    return newAlert;
  }

  /**
   * Action: Acknowledge alert by duty officer
   */
  public acknowledgeAlert(id: string, officerName = 'Command Duty Officer (EOC)'): AlertObject | null {
    let updated: AlertObject | null = null;
    const nowIst = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    this.alerts = this.alerts.map((alert) => {
      if (alert.id === id) {
        updated = {
          ...alert,
          status: 'ACKNOWLEDGED',
          acknowledgedBy: officerName,
          acknowledgedAt: `Just now (${nowIst})`,
        };
        return updated;
      }
      return alert;
    });

    if (updated) {
      this.notifyListeners();
    }
    return updated;
  }

  /**
   * Action: Escalate alert to SDMA / NDMA
   */
  public escalateAlert(id: string, targetAuthority = 'State Disaster Management Authority (SDMA) & NDMA Lead'): AlertObject | null {
    let updated: AlertObject | null = null;
    const nowIst = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    this.alerts = this.alerts.map((alert) => {
      if (alert.id === id) {
        updated = {
          ...alert,
          status: 'ESCALATED',
          severity: alert.severity === 'WARNING' ? 'DANGER' : alert.severity === 'DANGER' ? 'CRITICAL' : alert.severity,
          escalatedTo: targetAuthority,
          escalatedAt: `Just now (${nowIst})`,
        };
        return updated;
      }
      return alert;
    });

    if (updated) {
      this.notifyListeners();
    }
    return updated;
  }

  /**
   * Action: Dispatch Emergency Response Team (NDRF / SDRF)
   */
  public dispatchResponseTeam(id: string, teamNames = ['NDRF 2nd Battalion (Quick Response Unit)', 'SDRF Mountain Rescue Alpha']): AlertObject | null {
    let updated: AlertObject | null = null;
    const nowIst = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    this.alerts = this.alerts.map((alert) => {
      if (alert.id === id) {
        updated = {
          ...alert,
          status: 'DISPATCHED',
          dispatchedTeams: Array.from(new Set([...(alert.dispatchedTeams || []), ...teamNames])),
          dispatchedAt: `Just now (${nowIst})`,
        };
        return updated;
      }
      return alert;
    });

    if (updated) {
      this.notifyListeners();
    }
    return updated;
  }

  /**
   * Action: Resolve alert after hazard mitigation
   */
  public resolveAlert(id: string, note = 'Hazard mitigated. Slope stabilized and highway reopened.'): AlertObject | null {
    let updated: AlertObject | null = null;
    const nowIst = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    this.alerts = this.alerts.map((alert) => {
      if (alert.id === id) {
        updated = {
          ...alert,
          status: 'RESOLVED',
          resolvedAt: `Just now (${nowIst})`,
          resolutionNote: note,
        };
        return updated;
      }
      return alert;
    });

    if (updated) {
      this.notifyListeners();
    }
    return updated;
  }

  public getMetrics() {
    const active = this.getActiveAlerts();
    return {
      totalActive: active.length,
      criticalCount: active.filter((a) => a.severity === 'CRITICAL').length,
      dangerCount: active.filter((a) => a.severity === 'DANGER').length,
      warningCount: active.filter((a) => a.severity === 'WARNING').length,
      watchCount: active.filter((a) => a.severity === 'WATCH').length,
      dispatchedCount: active.filter((a) => a.status === 'DISPATCHED').length,
      totalRecipientsReached: this.alerts.reduce(
        (sum, a) => sum + a.deliveryLog.reduce((dSum, d) => dSum + d.recipientCount, 0),
        0
      ),
    };
  }
}

export const alertService = new AlertService();
