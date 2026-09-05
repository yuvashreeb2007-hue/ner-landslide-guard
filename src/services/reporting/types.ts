// TypeScript definitions for the Field Reporting and AI Computer Vision Module

export type ReportIncidentType = 
  | 'Landslide' 
  | 'Road Blockage' 
  | 'Crack' 
  | 'Slope Movement' 
  | 'Flood';

export type ReportSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type ReportStatus = 
  | 'NEW' 
  | 'VERIFIED' 
  | 'INVESTIGATING' 
  | 'RESOLVED' 
  | 'REJECTED';

export type ReporterType = 
  | 'Citizen' 
  | 'Field Officer' 
  | 'NDRF Scout' 
  | 'BRO Patrol' 
  | 'Forest Guard' 
  | 'Police Patrol';

export interface VisionAnalysisResult {
  detectedIssue: string;
  confidence: number; // 0.0 - 1.0 (e.g. 0.87 for 87%)
  severity: ReportSeverity;
  observations: string;
  geotechnicalTags: string[];
  recommendedAction: string;
  annotatedFeatures?: {
    label: string;
    score: number;
    bbox?: [number, number, number, number];
  }[];
  processedAt: string;
}

export interface FieldReportInput {
  incidentType: ReportIncidentType;
  description: string;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  village: string;
  photoUrl?: string;
  videoUrl?: string;
  reporterType: ReporterType;
  reporterName: string;
  contactPhone?: string;
  roadBlocked?: boolean;
  structuresAtRisk?: number;
  aiVisionAnalysis?: VisionAnalysisResult;
}

export interface FieldReportRecord extends FieldReportInput {
  id: string;
  timestamp: string;
  status: ReportStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  adminNotes?: string;
  dispatchedTeams?: string[];
}
