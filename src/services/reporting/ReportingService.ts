import { 
  FieldReportInput, 
  FieldReportRecord, 
  ReportStatus, 
  ReportIncidentType 
} from './types';
import { apiClient } from '@/services/api/apiClient';

export const INITIAL_REPORTS: FieldReportRecord[] = [
  {
    id: 'REP-2026-SK-8921',
    incidentType: 'Crack',
    description: 'Noticed 3-inch wide tension cracks opening along the retaining wall above the lower Singtam market road after continuous morning downpour.',
    severity: 'HIGH',
    latitude: 27.2380,
    longitude: 88.5140,
    district: 'Pakyong',
    state: 'Sikkim',
    village: 'Singtam Lower Bazaar',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    reporterType: 'Citizen',
    reporterName: 'Tashi Bhutia',
    contactPhone: '+91 98451 22341',
    roadBlocked: false,
    structuresAtRisk: 4,
    status: 'INVESTIGATING',
    timestamp: '2026-09-05T07:15:00Z',
    verifiedBy: 'Er. D. Lepcha (SDRF Gangtok)',
    verifiedAt: '2026-09-05T08:30:00Z',
    adminNotes: 'Quick response scout deployed. Crack displacement monitoring installed.',
    dispatchedTeams: ['SDRF Gangtok Unit 2', 'Pakyong PWD Highway Patrol'],
    aiVisionAnalysis: {
      detectedIssue: 'Possible slope crack',
      confidence: 0.87,
      severity: 'HIGH',
      observations: 'Visible linear fracture on slope surface with continuous 2.5m displacement across the retaining berm.',
      geotechnicalTags: ['Linear Surface Crack', 'Tension Fissure', 'Water Infiltration Trace'],
      recommendedAction: 'Immediate geotechnical probe inspection and provisional single-lane restriction.',
      processedAt: '2026-09-05T07:16:00Z'
    }
  },
  {
    id: 'REP-2026-ML-4412',
    incidentType: 'Landslide',
    description: 'Massive debris flow triggered near Sohra escarpment. Mud and boulders spilled across 40 meters of SH-5.',
    severity: 'CRITICAL',
    latitude: 25.2750,
    longitude: 91.7380,
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    village: 'Sohra Cherrapunji Ridge',
    photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600',
    reporterType: 'Field Officer',
    reporterName: 'Banteilang Lyngdoh',
    contactPhone: '+91 94361 88920',
    roadBlocked: true,
    structuresAtRisk: 2,
    status: 'VERIFIED',
    timestamp: '2026-09-05T06:00:00Z',
    verifiedBy: 'State EOC Meghalaya',
    verifiedAt: '2026-09-05T06:20:00Z',
    adminNotes: 'BRO GREF notified. Heavy earthmoving clearing squad in transit.',
    dispatchedTeams: ['BRO 752 BRTF', 'Meghalaya Police Patrol Sohra'],
    aiVisionAnalysis: {
      detectedIssue: 'Active Rotational Landslide Debris Scar',
      confidence: 0.94,
      severity: 'CRITICAL',
      observations: 'Fresh scarp headwall visible with wet liquefied mudflow moving downslope toward roadway.',
      geotechnicalTags: ['Rotational Scarp', 'Mudflow Debris', 'Shear Failure'],
      recommendedAction: 'Immediate community evacuation within 400m radius of slope toe.',
      processedAt: '2026-09-05T06:01:00Z'
    }
  },
  {
    id: 'REP-2026-MN-1109',
    incidentType: 'Slope Movement',
    description: 'Slope creep accelerating near Railway Tunnel 12 portal with noticeable subsidence on access road shoulder.',
    severity: 'HIGH',
    latitude: 24.7890,
    longitude: 93.6540,
    district: 'Noney',
    state: 'Manipur',
    village: 'Tupul Station Axis',
    photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    reporterType: 'BRO Patrol',
    reporterName: 'Subedar R. K. Sharma',
    contactPhone: '+91 97740 55123',
    roadBlocked: false,
    structuresAtRisk: 6,
    status: 'NEW',
    timestamp: '2026-09-05T08:45:00Z',
    aiVisionAnalysis: {
      detectedIssue: 'Active Slope Creep & Retaining Wall Bulging',
      confidence: 0.85,
      severity: 'HIGH',
      observations: 'Noticeable outward deformation on masonry retaining structure with tilted vegetation canopy.',
      geotechnicalTags: ['Retaining Wall Bulge', 'Slope Creep', 'Shear Plane Genesis'],
      recommendedAction: 'Install tilt sensors and relief weep holes to alleviate hydrostatic backpressure.',
      processedAt: '2026-09-05T08:46:00Z'
    }
  },
  {
    id: 'REP-2026-AS-2231',
    incidentType: 'Road Blockage',
    description: 'Tree fall and earth slump on Lumding-Haflong hill road cleared. Single lane reopened for emergency ambulances.',
    severity: 'MODERATE',
    latitude: 25.1764,
    longitude: 93.0234,
    district: 'Dima Hasao',
    state: 'Assam',
    village: 'Lower Haflong Bypass',
    photoUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600',
    reporterType: 'Police Patrol',
    reporterName: 'ASI Pranjal Das',
    contactPhone: '+91 98640 12345',
    roadBlocked: false,
    structuresAtRisk: 0,
    status: 'RESOLVED',
    timestamp: '2026-09-04T16:30:00Z',
    verifiedBy: 'Assam SDMA',
    adminNotes: 'Carriageway cleared. Traffic flow normal.',
    aiVisionAnalysis: {
      detectedIssue: 'Severe Roadway Obstruction & Debris Dam',
      confidence: 0.91,
      severity: 'MODERATE',
      observations: 'Cleared debris berm with stabilized shoulder.',
      geotechnicalTags: ['Debris Cleared', 'Shoulder Stabilized'],
      recommendedAction: 'Standard routine vigilance.',
      processedAt: '2026-09-04T16:32:00Z'
    }
  }
];

class ReportingService {
  private reports: FieldReportRecord[];
  private listeners: Set<(reports: FieldReportRecord[]) => void> = new Set();

  constructor() {
    this.reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
  }

  public async getReports(statusFilter?: string, typeFilter?: string): Promise<FieldReportRecord[]> {
    let list = [...this.reports];
    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (typeFilter && typeFilter !== 'ALL') {
      list = list.filter((r) => r.incidentType === typeFilter);
    }
    return list;
  }

  public async getReportById(id: string): Promise<FieldReportRecord | null> {
    const found = this.reports.find((r) => r.id === id);
    return found ? { ...found } : null;
  }

  public async submitReport(input: FieldReportInput): Promise<FieldReportRecord> {
    const statePrefix = input.state ? input.state.substring(0, 2).toUpperCase() : 'NER';
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newId = `REP-${new Date().getFullYear()}-${statePrefix}-${randomCode}`;

    const newRecord: FieldReportRecord = {
      ...input,
      id: newId,
      timestamp: new Date().toISOString(),
      status: 'NEW',
    };

    // Prepend to top of list
    this.reports.unshift(newRecord);
    this.notify();

    // Async sync with FastAPI backend
    try {
      apiClient.submitReport({
        reporterName: input.reporterName,
        reporterPhone: input.contactPhone,
        role: input.reporterType,
        district: input.district,
        state: input.state,
        locationName: `${input.village}, ${input.district}`,
        latitude: input.latitude,
        longitude: input.longitude,
        hazardType: input.incidentType,
        urgencyLevel: input.severity,
        description: input.description,
        roadBlocked: input.roadBlocked || false,
        structuresAtRisk: input.structuresAtRisk || 0,
        photoUrl: input.photoUrl
      }).catch((err) => console.warn('[ReportingService] FastAPI sync notice:', err));
    } catch {
      // safe fallback
    }

    return newRecord;
  }

  public async updateReportStatus(
    id: string,
    newStatus: ReportStatus,
    adminNotes?: string,
    verifiedBy?: string
  ): Promise<FieldReportRecord | null> {
    const index = this.reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.reports[index] = {
      ...this.reports[index],
      status: newStatus,
      adminNotes: adminNotes || this.reports[index].adminNotes,
      verifiedBy: verifiedBy || this.reports[index].verifiedBy || 'EOC Operations Duty Officer',
      verifiedAt: new Date().toISOString(),
    };

    this.notify();
    return { ...this.reports[index] };
  }

  public subscribe(callback: (reports: FieldReportRecord[]) => void): () => void {
    this.listeners.add(callback);
    callback([...this.reports]);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    const copy = [...this.reports];
    this.listeners.forEach((fn) => fn(copy));
  }
}

export const reportingService = new ReportingService();
