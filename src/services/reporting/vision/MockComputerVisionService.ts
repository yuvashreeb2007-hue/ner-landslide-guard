import { VisionProvider } from './VisionProvider';
import { VisionAnalysisResult, ReportIncidentType, ReportSeverity } from '../types';

export interface SampleDisasterPhoto {
  id: string;
  name: string;
  url: string;
  incidentType: ReportIncidentType;
  description: string;
}

export const SAMPLE_DISASTER_PHOTOS: SampleDisasterPhoto[] = [
  {
    id: 'sample-crack',
    name: 'Tension Fracture on Highway Retaining Berm',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    incidentType: 'Crack',
    description: 'Longitudinal surface fracture on saturated hillside road shoulder.'
  },
  {
    id: 'sample-slide',
    name: 'Rotational Mudflow & Rock Debris Runout',
    url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600',
    incidentType: 'Landslide',
    description: 'Active mudslide deposited earth on lower carriage lane.'
  },
  {
    id: 'sample-blockage',
    name: 'Rockfall Carriageway Inundation',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    incidentType: 'Road Blockage',
    description: 'Boulders and rubble blocking transport lifeline.'
  },
  {
    id: 'sample-flood',
    name: 'River Flash Silt Surging',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600',
    incidentType: 'Flood',
    description: 'High turbid water breaching road culvert.'
  }
];

export class MockComputerVisionService implements VisionProvider {
  async analyzeImage(
    imageSource: string | File,
    suggestedIncidentType: ReportIncidentType = 'Landslide'
  ): Promise<VisionAnalysisResult> {
    // Simulate neural network model inference latency (800ms)
    await new Promise((res) => setTimeout(res, 800));

    const sourceString = typeof imageSource === 'string' ? imageSource : imageSource.name;

    // Pattern recognition based on image signature / suggested type
    if (suggestedIncidentType === 'Crack' || sourceString.includes('crack')) {
      return {
        detectedIssue: 'Possible slope crack',
        confidence: 0.87,
        severity: 'HIGH',
        observations: 'Visible linear fracture on slope surface with continuous 2.5m displacement across the retaining berm.',
        geotechnicalTags: ['Linear Surface Crack', 'Tension Fissure', 'Water Infiltration Trace'],
        recommendedAction: 'Immediate geotechnical probe inspection and provisional single-lane traffic restriction.',
        annotatedFeatures: [
          { label: 'Tension Crack Boundary', score: 0.89, bbox: [120, 85, 340, 210] },
          { label: 'Eroded Soil Horizon', score: 0.84, bbox: [300, 190, 480, 310] },
        ],
        processedAt: new Date().toISOString()
      };
    }

    if (suggestedIncidentType === 'Road Blockage' || sourceString.includes('block')) {
      return {
        detectedIssue: 'Severe Roadway Obstruction & Debris Dam',
        confidence: 0.93,
        severity: 'CRITICAL',
        observations: 'Estimated 80-meter rock and earth runout completely blocking dual-lane highway corridor. High secondary slide hazard.',
        geotechnicalTags: ['Highway Blockage', 'Boulder Dispersion', 'Slope Cleaving'],
        recommendedAction: 'Deploy BRO heavy earthmovers (JCB/Excavator) and divert all transit via alternate ridge bypass.',
        annotatedFeatures: [
          { label: 'Blocked Roadway Section', score: 0.95, bbox: [50, 100, 520, 380] },
          { label: 'Unstable Overburden Crown', score: 0.88, bbox: [200, 20, 400, 110] },
        ],
        processedAt: new Date().toISOString()
      };
    }

    if (suggestedIncidentType === 'Flood' || sourceString.includes('flood')) {
      return {
        detectedIssue: 'Culvert Overtopping & Flash Flood Mudflow',
        confidence: 0.91,
        severity: 'HIGH',
        observations: 'Rapid surface runoff overflowing drainage culverts with active toe erosion along embankment.',
        geotechnicalTags: ['Embankment Scour', 'Culvert Choke', 'Pore Saturation'],
        recommendedAction: 'Clear culvert inlet debris and construct sandbag deflectors along vulnerable habitations.',
        annotatedFeatures: [
          { label: 'Submerged Culvert', score: 0.92, bbox: [140, 180, 360, 340] },
        ],
        processedAt: new Date().toISOString()
      };
    }

    if (suggestedIncidentType === 'Slope Movement' || sourceString.includes('movement')) {
      return {
        detectedIssue: 'Active Slope Creep & Retaining Wall Bulging',
        confidence: 0.85,
        severity: 'HIGH',
        observations: 'Noticeable outward deformation on masonry retaining structure with tilted vegetation canopy.',
        geotechnicalTags: ['Retaining Wall Bulge', 'Slope Creep', 'Shear Plane Genesis'],
        recommendedAction: 'Install tilt sensors and relief weep holes to alleviate hydrostatic backpressure.',
        annotatedFeatures: [
          { label: 'Wall Bulge Deflection', score: 0.87, bbox: [110, 120, 310, 360] },
        ],
        processedAt: new Date().toISOString()
      };
    }

    // Default Landslide detection
    return {
      detectedIssue: 'Active Rotational Landslide Debris Scar',
      confidence: 0.94,
      severity: 'CRITICAL',
      observations: 'Fresh scarp headwall visible with wet liquefied mudflow moving downslope toward settlement boundary.',
      geotechnicalTags: ['Rotational Scarp', 'Mudflow Debris', 'Shear Failure'],
      recommendedAction: 'Immediate community evacuation within 400m radius of slope toe. Mobilize NDRF/SDRF emergency quick response teams.',
      annotatedFeatures: [
        { label: 'Active Slide Scarp', score: 0.96, bbox: [80, 50, 460, 280] },
        { label: 'Liquefied Mudflow', score: 0.91, bbox: [160, 260, 490, 420] },
      ],
      processedAt: new Date().toISOString()
    };
  }
}
