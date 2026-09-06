/**
 * Emergency Service for NER LandslideGuard
 * Manages prioritized disaster incident queues, specialized response battalion taskforces,
 * dispatch authorizations, and relationship chain graph extraction.
 */

import {
  EmergencyTeam,
  PrioritizedIncident,
  IncidentRelationshipChain,
  ReliefCamp
} from './types';
import { PrioritizationEngine } from './PrioritizationEngine';

// Specialized Mountain Rescue & Engineering Taskforces across Northeast India
export const MOCK_RESPONSE_TEAMS: EmergencyTeam[] = [
  {
    id: 'TEAM-NDRF-02-SK',
    name: 'NDRF 2nd Battalion (Sikkim Mountain Strike Unit)',
    unit: '2nd Bn National Disaster Response Force',
    baseLocation: 'Pakyong Airport Base, Sikkim',
    state: 'Sikkim',
    latitude: 27.234,
    longitude: 88.588,
    personnelCount: 45,
    status: 'Standing By',
    specialization: 'Mountain Search & Rescue',
    equipment: ['Hydraulic Cutters', 'Life Detectors', 'Canine Search Unit', 'High-Angle Ropes', 'Satellite Comms'],
    contactOfficer: 'Commandant R. K. Sharma',
    contactPhone: '+91 94340 12890',
    activeDispatchesCount: 0,
  },
  {
    id: 'TEAM-BRO-SWASTIK',
    name: 'BRO Project Swastik (NH-10 Heavy Clearance Unit)',
    unit: 'Border Roads Organisation Heavy Machinery Taskforce',
    baseLocation: 'Rangpo Logistics Depôt, NH-10',
    state: 'Sikkim',
    latitude: 27.178,
    longitude: 88.529,
    personnelCount: 32,
    status: 'Standing By',
    specialization: 'Heavy Debris Clearing',
    equipment: ['Komatsu PC210 Excavators (x4)', 'CAT D6 Bulldozers (x2)', 'Rock Breakers', 'Dump Trucks (x8)'],
    contactOfficer: 'Col. Vikram Singh (Director Works)',
    contactPhone: '+91 98110 44321',
    activeDispatchesCount: 0,
  },
  {
    id: 'TEAM-SDRF-SK-01',
    name: 'SDRF Sikkim Mountain Rescue Alpha',
    unit: 'State Disaster Response Force Sikkim',
    baseLocation: 'Gangtok Fire & Rescue Station',
    state: 'Sikkim',
    latitude: 27.338,
    longitude: 88.612,
    personnelCount: 28,
    status: 'Standing By',
    specialization: 'Swift Water & Mudflow',
    equipment: ['Inflatable Rafts', 'Stretcher Winches', 'Thermal Imaging Drones', 'Mobile Medical Trauma Unit'],
    contactOfficer: 'Deputy Commandant Tenzing Lepcha',
    contactPhone: '+91 98001 55678',
    activeDispatchesCount: 0,
  },
  {
    id: 'TEAM-SDRF-MG-01',
    name: 'Meghalaya SDRF Rapid Intervention Taskforce',
    unit: 'Meghalaya State Disaster Response Force',
    baseLocation: 'Sohra Mountain Outpost, East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.298,
    longitude: 91.708,
    personnelCount: 30,
    status: 'Standing By',
    specialization: 'Mountain Search & Rescue',
    equipment: ['Gorge Rope Rescue Systems', 'Mud Evacuation Pumps', '4x4 Rescue Ambulances'],
    contactOfficer: 'Inspector D. Lyngdoh',
    contactPhone: '+91 94361 09876',
    activeDispatchesCount: 0,
  },
  {
    id: 'TEAM-SDRF-AS-02',
    name: 'Assam SDRF (Dima Hasao Hill Section)',
    unit: 'Assam State Disaster Response Force',
    baseLocation: 'Haflong Battalion HQ, Assam',
    state: 'Assam',
    latitude: 25.168,
    longitude: 93.018,
    personnelCount: 35,
    status: 'Standing By',
    specialization: 'Evacuation Logistics',
    equipment: ['Heavy Track Clearing Winches', 'Amphibious All-Terrain Carriers', 'Mobile Shelter Kits'],
    contactOfficer: 'Assistant Commandant B. Bora',
    contactPhone: '+91 94350 33412',
    activeDispatchesCount: 0,
  },
  {
    id: 'TEAM-NDRF-12-AR',
    name: 'NDRF 12th Battalion (Arunachal Sector)',
    unit: '12th Bn National Disaster Response Force',
    baseLocation: 'Doimukh Base, Papum Pare, Arunachal',
    state: 'Arunachal Pradesh',
    latitude: 27.142,
    longitude: 93.754,
    personnelCount: 40,
    status: 'Standing By',
    specialization: 'Mountain Search & Rescue',
    equipment: ['Ground Penetrating Radar', 'Emergency Airfield Lighting', 'Air-Drop Rescue Baskets'],
    contactOfficer: 'Commandant P. Tagung',
    contactPhone: '+91 94360 88219',
    activeDispatchesCount: 0,
  },
  {
    id: 'TEAM-BRO-VARTAK',
    name: 'BRO Project Vartak (Tenga-Bhalukpong Division)',
    unit: 'Border Roads Task Force Vartak',
    baseLocation: 'Bhalukpong Border Logistics Base, NH-13',
    state: 'Arunachal Pradesh',
    latitude: 27.012,
    longitude: 92.651,
    personnelCount: 25,
    status: 'Standing By',
    specialization: 'Heavy Debris Clearing',
    equipment: ['Tracked Excavators (x3)', 'Hydraulic Rock Splitters', 'Steel Bailey Bridge Units'],
    contactOfficer: 'Lt. Col. S. Chettri',
    contactPhone: '+91 94362 77102',
    activeDispatchesCount: 0,
  },
  {
    id: 'TEAM-SDRF-MN-01',
    name: 'Manipur SDRF Mountain Commando Unit',
    unit: 'Manipur State Disaster Response Force',
    baseLocation: 'Noney District Headquarters',
    state: 'Manipur',
    latitude: 24.812,
    longitude: 93.654,
    personnelCount: 26,
    status: 'Standing By',
    specialization: 'Swift Water & Mudflow',
    equipment: ['Ijei River Rescue Zodiacs', 'High-Angle Evacuation Hoists', 'Mobile Sat-Hub'],
    contactOfficer: 'Inspector N. Singh',
    contactPhone: '+91 98620 44551',
    activeDispatchesCount: 0,
  },
];

export const MOCK_RELIEF_CAMPS: ReliefCamp[] = [
  {
    id: 'CAMP-SK-01',
    name: 'Singtam Senior Secondary School & Stadium Relief Node',
    district: 'Pakyong',
    state: 'Sikkim',
    capacity: 1800,
    currentOccupancy: 1140,
    medicalTeam: 'Active (2 Doctors, 6 SDRF Paramedics)',
    foodWaterStatus: 'Adequate Stock (5 Days Buffer)',
    powerBackup: true,
    contactOfficer: 'SDM Pakyong (Camp Director)',
    contactPhone: '+91 94340 77123',
  },
  {
    id: 'CAMP-MG-02',
    name: 'Mawkdok Tourist Eco-Lodge Emergency Shelter',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    capacity: 650,
    currentOccupancy: 390,
    medicalTeam: 'Mobile Health Unit (PHC Sohra)',
    foodWaterStatus: 'Supplied by District EOC',
    powerBackup: true,
    contactOfficer: 'BDO Khatarshnong Laitkroh',
    contactPhone: '+91 98630 11982',
  },
  {
    id: 'CAMP-AS-03',
    name: 'Haflong Government College Gymnasium Shelter',
    district: 'Dima Hasao',
    state: 'Assam',
    capacity: 2200,
    currentOccupancy: 1480,
    medicalTeam: 'Civil Hospital Haflong Field Unit',
    foodWaterStatus: 'Adequate Stock (4 Days Buffer)',
    powerBackup: true,
    contactOfficer: 'Assistant Commissioner (Relief)',
    contactPhone: '+91 94350 66219',
  },
  {
    id: 'CAMP-MN-04',
    name: 'Tupul Railway Yard Disaster Relief Camp',
    district: 'Noney',
    state: 'Manipur',
    capacity: 900,
    currentOccupancy: 420,
    medicalTeam: 'Assam Rifles Medical Post',
    foodWaterStatus: 'Supplied via NH-37 Convoy',
    powerBackup: true,
    contactOfficer: 'District Relief Officer',
    contactPhone: '+91 98560 99214',
  },
];

const INITIAL_RAW_INCIDENTS = [
  {
    id: 'INC-2026-SK-01',
    title: 'Severe NH-10 Highway Severance & Toe Collapse',
    district: 'Pakyong',
    state: 'Sikkim' as const,
    location: 'Singtam 29th Mile Retaining Wall, NH-10 Corridor',
    latitude: 27.2341,
    longitude: 88.4892,
    elevation: 780,
    hazardType: 'Catastrophic Slide & Debris Cone',
    severity: 'CRITICAL' as const,
    riskScore: 94,
    affectedPopulation: 14800,
    reportedTime: '15 Mins Ago',
    status: 'Active' as const,
    description: 'Massive slope toe breach along NH-10. Multiple fissures extending 120m across uphill terrace.',
    recommendedAction: 'Immediate high-angle rope evacuation of lower Singtam settlement. Total vehicular halt on NH-10. Deploy BRO Swastik rock splitters.',
    roadName: 'NH-10 (Siliguri - Gangtok Lifeline)',
    roadStatus: 'Completely Blocked' as const,
    roadBlockageDistanceKm: 14.5,
    detourAvailable: false,
    affectedVillages: [
      { name: 'Singtam Bazaar East', population: 6400, isolationRisk: 'CRITICAL' as const, evacuationCenterName: 'Singtam High School Ground' },
      { name: '29th Mile Basti', population: 3800, isolationRisk: 'CRITICAL' as const, evacuationCenterName: 'Singtam Community Hall' },
      { name: 'Dikchu Lower Reach', population: 4600, isolationRisk: 'HIGH' as const, evacuationCenterName: 'Singtam Senior Secondary Stadium' },
    ],
    rainfall24hMm: 184.2,
    rainfallIntensityMmHr: 32.0,
    weatherCondition: 'Extreme Torrential Cloudburst (AWS Pakyong > 180mm)',
    nearestTeamDistanceKm: 18.0,
  },
  {
    id: 'INC-2026-MG-02',
    title: 'Gorge Embankment Subsidence & Debris Flow',
    district: 'East Khasi Hills',
    state: 'Meghalaya' as const,
    location: 'Mawkdok Bridge - Sohra Escarpment, SH-5',
    latitude: 25.352,
    longitude: 91.734,
    elevation: 1250,
    hazardType: 'Mudflow Inundation',
    severity: 'HIGH' as const,
    riskScore: 78,
    affectedPopulation: 8200,
    reportedTime: '32 Mins Ago',
    status: 'Active' as const,
    description: 'Rapid mudflow spilling into valley drainage. Pavement cracking on Mawkdok bridge approach road.',
    recommendedAction: 'Deploy SDRF Meghalaya gorge extraction team. Issue pre-evacuation alert to lower Mawkdok and Laitkroh hamlet.',
    roadName: 'SH-5 (Shillong - Cherrapunjee Highway)',
    roadStatus: 'Partial Lane Open' as const,
    roadBlockageDistanceKm: 22.0,
    detourAvailable: true,
    affectedVillages: [
      { name: 'Mawkdok Hamlet', population: 3100, isolationRisk: 'HIGH' as const, evacuationCenterName: 'Mawkdok Tourist Lodge Shelter' },
      { name: 'Laitkroh Lower Reach', population: 2800, isolationRisk: 'MODERATE' as const, evacuationCenterName: 'Mawkdok Community Hall' },
      { name: 'Sohra Escarpment Toe', population: 2300, isolationRisk: 'HIGH' as const, evacuationCenterName: 'Cherrapunjee Civil Shelter' },
    ],
    rainfall24hMm: 142.5,
    rainfallIntensityMmHr: 22.0,
    weatherCondition: 'Heavy Continuous Downpour (AWS Sohra 142mm)',
    nearestTeamDistanceKm: 24.0,
  },
  {
    id: 'INC-2026-AS-03',
    title: 'Hill Cutting Collapse & Railway Track Obstruction',
    district: 'Dima Hasao',
    state: 'Assam' as const,
    location: 'Jatinga - Haflong Section, NH-27 & Lumding Rail Link',
    latitude: 25.123,
    longitude: 92.981,
    elevation: 640,
    hazardType: 'Cutting Slope Failure',
    severity: 'HIGH' as const,
    riskScore: 72,
    affectedPopulation: 5800,
    reportedTime: '55 Mins Ago',
    status: 'Active' as const,
    description: 'Debris from hill cutting covering NH-27 single carriageway and adjacent railway track bed.',
    recommendedAction: 'Halt rail movement on Lumding-Badarpur section. Deploy heavy excavators for carriageway clearance.',
    roadName: 'NH-27 (East-West Corridor Hill Section)',
    roadStatus: 'Partial Lane Open' as const,
    roadBlockageDistanceKm: 31.0,
    detourAvailable: true,
    affectedVillages: [
      { name: 'Jatinga Valley Settlement', population: 2600, isolationRisk: 'HIGH' as const, evacuationCenterName: 'Haflong Government College' },
      { name: 'Haflong Lower Colony', population: 3200, isolationRisk: 'MODERATE' as const, evacuationCenterName: 'Haflong Indoor Stadium' },
    ],
    rainfall24hMm: 98.0,
    rainfallIntensityMmHr: 16.0,
    weatherCondition: 'Monsoon Showers with Low Visibility',
    nearestTeamDistanceKm: 14.0,
  },
  {
    id: 'INC-2026-AR-04',
    title: 'Rockfall & Escarpment Crown Failure',
    district: 'West Kameng',
    state: 'Arunachal Pradesh' as const,
    location: 'Bhalukpong - Tenga Valley Road, NH-13',
    latitude: 27.21,
    longitude: 92.54,
    elevation: 1120,
    hazardType: 'Rockfall & Talus Inundation',
    severity: 'HIGH' as const,
    riskScore: 82,
    affectedPopulation: 4500,
    reportedTime: '1 Hour Ago',
    status: 'Active' as const,
    description: 'Massive granite boulders dislodged from 45-degree slope. Both carriageway lanes completely obstructed.',
    recommendedAction: 'Mobilize BRO Project Vartak rock splitters. Divert civilian traffic via alternate Bomdila bypass.',
    roadName: 'NH-13 (Trans-Arunachal Highway Segment)',
    roadStatus: 'Completely Blocked' as const,
    roadBlockageDistanceKm: 38.0,
    detourAvailable: true,
    affectedVillages: [
      { name: 'Tenga Lower Camp', population: 2400, isolationRisk: 'HIGH' as const, evacuationCenterName: 'Tenga Military Field Shelter' },
      { name: 'Sessa Orchid Valley', population: 2100, isolationRisk: 'HIGH' as const, evacuationCenterName: 'Bhalukpong Community Center' },
    ],
    rainfall24hMm: 135.0,
    rainfallIntensityMmHr: 24.0,
    weatherCondition: 'Heavy Orographic Rainfall',
    nearestTeamDistanceKm: 28.0,
  },
  {
    id: 'INC-2026-MN-05',
    title: 'Riverbank Toe Erosion & Road Subsidence',
    district: 'Noney',
    state: 'Manipur' as const,
    location: 'Tupul Railway Yard & Ijei River Crossing, NH-37',
    latitude: 24.812,
    longitude: 93.654,
    elevation: 520,
    hazardType: 'Bank Erosion & Slump',
    severity: 'MODERATE' as const,
    riskScore: 56,
    affectedPopulation: 3100,
    reportedTime: '2 Hours Ago',
    status: 'Active' as const,
    description: 'Swollen Ijei river eroding highway embankment toe. Tensile cracks visible on road asphalt.',
    recommendedAction: 'Restrict heavy truck transit to single lane. Erect sandbag revetment along toe line.',
    roadName: 'NH-37 (Imphal - Jiribam Highway)',
    roadStatus: 'High Risk Warning' as const,
    roadBlockageDistanceKm: 25.0,
    detourAvailable: false,
    affectedVillages: [
      { name: 'Tupul Village', population: 1800, isolationRisk: 'MODERATE' as const, evacuationCenterName: 'Tupul Railway Yard Camp' },
      { name: 'Awangkhul Basti', population: 1300, isolationRisk: 'LOW' as const, evacuationCenterName: 'Noney District School' },
    ],
    rainfall24hMm: 72.0,
    rainfallIntensityMmHr: 12.0,
    weatherCondition: 'Overcast with Intermittent Drizzle',
    nearestTeamDistanceKm: 12.0,
  },
  {
    id: 'INC-2026-NL-06',
    title: 'Pavement Slump & Retaining Wall Bulge',
    district: 'Kohima',
    state: 'Nagaland' as const,
    location: 'Phesama - Zubza NH-29 Bypass',
    latitude: 25.645,
    longitude: 94.092,
    elevation: 1440,
    hazardType: 'Slow Slope Creep',
    severity: 'LOW' as const,
    riskScore: 36,
    affectedPopulation: 1600,
    reportedTime: '3 Hours Ago',
    status: 'Monitoring' as const,
    description: 'Minor retaining wall displacement (15mm) recorded by extensometer. Traffic moving slowly.',
    recommendedAction: 'Maintain live sensor surveillance. Keep local PWD patrol on 2-hour inspection routine.',
    roadName: 'NH-29 (Dimapur - Kohima Highway)',
    roadStatus: 'Clear' as const,
    roadBlockageDistanceKm: 16.0,
    detourAvailable: true,
    affectedVillages: [
      { name: 'Phesama Village', population: 1600, isolationRisk: 'LOW' as const, evacuationCenterName: 'Phesama Village Council Hall' },
    ],
    rainfall24hMm: 34.0,
    rainfallIntensityMmHr: 5.0,
    weatherCondition: 'Light Rain & Fog',
    nearestTeamDistanceKm: 16.0,
  },
];

export class EmergencyService {
  private responseTeams: EmergencyTeam[] = [...MOCK_RESPONSE_TEAMS];
  private reliefCamps: ReliefCamp[] = [...MOCK_RELIEF_CAMPS];
  private incidents: PrioritizedIncident[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.recalculateAndSortQueue();
  }

  /**
   * Recalculates Emergency Priority Scores and ETAs for all incidents and sorts P1 -> P4
   */
  public recalculateAndSortQueue(): void {
    this.incidents = INITIAL_RAW_INCIDENTS.map((inc) => {
      const priority = PrioritizationEngine.calculatePriorityScore({
        riskScore: inc.riskScore,
        populationExposed: inc.affectedPopulation,
        roadStatus: inc.roadStatus,
        distanceToServicesKm: inc.nearestTeamDistanceKm,
        severity: inc.severity,
        affectedVillagesCount: inc.affectedVillages.length,
        rainfall24hMm: inc.rainfall24hMm,
        rainfallIntensityMmHr: inc.rainfallIntensityMmHr,
      });

      const estimatedEtaMinutes = PrioritizationEngine.calculateDynamicEta({
        distanceKm: inc.nearestTeamDistanceKm,
        roadStatus: inc.roadStatus,
        hasHeavyMachinery: inc.hazardType.includes('Rockfall') || inc.roadStatus === 'Completely Blocked',
        weatherSeverity: inc.rainfall24hMm > 120 ? 'HEAVY_RAIN' : 'NORMAL',
      });

      return {
        ...inc,
        priority,
        estimatedEtaMinutes,
      };
    }).sort((a, b) => b.priority.score - a.priority.score);
  }

  public getPrioritizedQueue(): PrioritizedIncident[] {
    return [...this.incidents];
  }

  public getResponseTeams(): EmergencyTeam[] {
    return [...this.responseTeams];
  }

  public getReliefCamps(): ReliefCamp[] {
    return [...this.reliefCamps];
  }

  public getIncidentById(id: string): PrioritizedIncident | undefined {
    return this.incidents.find((i) => i.id === id);
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
        console.error('Error in EmergencyService listener:', e);
      }
    });
  }

  /**
   * Dispatches a specific response team to an incident
   */
  public dispatchTeam(incidentId: string, teamId: string): {
    success: boolean;
    incident: PrioritizedIncident;
    team: EmergencyTeam;
    etaMinutes: number;
  } {
    const targetTeam = this.responseTeams.find((t) => t.id === teamId);
    const targetInc = this.incidents.find((i) => i.id === incidentId);

    if (!targetTeam || !targetInc) {
      throw new Error(`Invalid incidentId ${incidentId} or teamId ${teamId}`);
    }

    const nowIst = new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST';

    // Calculate dynamic ETA for this specific team
    const distanceKm = targetInc.nearestTeamDistanceKm;
    const etaMinutes = PrioritizationEngine.calculateDynamicEta({
      distanceKm,
      roadStatus: targetInc.roadStatus,
      hasHeavyMachinery: targetTeam.specialization === 'Heavy Debris Clearing',
      weatherSeverity: targetInc.rainfall24hMm > 120 ? 'HEAVY_RAIN' : 'NORMAL',
    });

    // Update Team State
    this.responseTeams = this.responseTeams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          status: 'Deployed',
          assignedIncidentId: incidentId,
          activeDispatchesCount: t.activeDispatchesCount + 1,
        };
      }
      return t;
    });

    // Update Incident State
    let updatedIncident: PrioritizedIncident = targetInc;
    this.incidents = this.incidents.map((inc) => {
      if (inc.id === incidentId) {
        updatedIncident = {
          ...inc,
          status: 'Response Dispatched',
          assignedTeamId: teamId,
          assignedTeamName: targetTeam.name,
          dispatchedAt: `Just now (${nowIst})`,
          estimatedEtaMinutes: etaMinutes,
        };
        return updatedIncident;
      }
      return inc;
    });

    this.notifyListeners();

    return {
      success: true,
      incident: updatedIncident,
      team: targetTeam,
      etaMinutes,
    };
  }

  /**
   * Recalls a deployed response team back to Standby
   */
  public recallTeam(teamId: string): void {
    this.responseTeams = this.responseTeams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          status: 'Standing By',
          assignedIncidentId: undefined,
        };
      }
      return t;
    });

    this.notifyListeners();
  }

  /**
   * Generates the multi-tier relationship chain:
   * Incident -> Road -> Village -> Population -> Response Team
   */
  public getRelationshipChain(incidentId: string): IncidentRelationshipChain | null {
    const inc = this.incidents.find((i) => i.id === incidentId);
    if (!inc) return null;

    const assignedTeam = inc.assignedTeamId
      ? this.responseTeams.find((t) => t.id === inc.assignedTeamId)
      : this.responseTeams.find((t) => t.state === inc.state) || this.responseTeams[0];

    const primaryVillage = inc.affectedVillages[0]?.name || 'Singtam Bazaar';
    const allVillages = inc.affectedVillages.map((v) => v.name);
    const totalExposed = inc.affectedPopulation;
    const highRiskCount = Math.round(totalExposed * 0.65);
    const evacuatedCount = inc.status === 'Response Dispatched' ? Math.round(totalExposed * 0.35) : 0;

    return {
      incident: {
        id: inc.id,
        name: inc.title,
        type: inc.hazardType,
        severity: inc.severity,
        priorityTier: inc.priority.tier,
        priorityScore: inc.priority.score,
        coordinates: `${inc.latitude.toFixed(3)}°N, ${inc.longitude.toFixed(3)}°E`,
      },
      road: {
        id: `RD-${inc.state.slice(0, 2).toUpperCase()}-01`,
        name: inc.roadName,
        route: `${inc.district} Lifeline Corridor`,
        status: inc.roadStatus,
        impactDescription: `${inc.roadStatus} • Detour: ${inc.detourAvailable ? 'Available via bypass' : 'No bypass (Isolated)'}`,
      },
      village: {
        primaryVillage,
        count: inc.affectedVillages.length,
        allVillages,
        evacuationCenter: inc.affectedVillages[0]?.evacuationCenterName || 'District Relief Stadium',
      },
      population: {
        totalExposed,
        highRiskCount,
        evacuatedCount,
      },
      responseTeam: {
        teamId: assignedTeam?.id || 'TBD',
        teamName: assignedTeam?.name || 'Awaiting Taskforce Authorization',
        unit: assignedTeam?.unit || 'NDRF / SDRF Specialized Taskforce',
        baseLocation: assignedTeam?.baseLocation || `${inc.district} Forward Post`,
        personnelCount: assignedTeam?.personnelCount || 30,
        status: assignedTeam?.status || 'Standing By',
        etaMinutes: inc.estimatedEtaMinutes,
      },
    };
  }

  public getMetrics() {
    const p1Count = this.incidents.filter((i) => i.priority.tier === 'P1').length;
    const p2Count = this.incidents.filter((i) => i.priority.tier === 'P2').length;
    const p3Count = this.incidents.filter((i) => i.priority.tier === 'P3').length;
    const p4Count = this.incidents.filter((i) => i.priority.tier === 'P4').length;
    const dispatchedCount = this.responseTeams.filter((t) => t.status === 'Deployed').length;
    const totalPopProtected = this.incidents.reduce((s, i) => s + i.affectedPopulation, 0);
    const avgEta = Math.round(
      this.incidents.reduce((s, i) => s + i.estimatedEtaMinutes, 0) / (this.incidents.length || 1)
    );

    return {
      totalIncidents: this.incidents.length,
      p1Count,
      p2Count,
      p3Count,
      p4Count,
      dispatchedCount,
      totalTeams: this.responseTeams.length,
      totalPopProtected,
      avgEtaMinutes: avgEta,
    };
  }
}

export const emergencyService = new EmergencyService();
