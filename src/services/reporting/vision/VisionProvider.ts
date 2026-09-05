import { VisionAnalysisResult, ReportIncidentType } from '../types';

/**
 * VisionProvider
 * Core interface for AI Computer Vision damage and landslide hazard assessment.
 * Allows seamless integration with real Gemini 1.5/2.0 Flash Vision, PyTorch YOLOv8,
 * or AWS Rekognition backends.
 */
export interface VisionProvider {
  /**
   * Analyzes an uploaded photo or image URL to detect geotechnical hazards, cracks, and severity.
   */
  analyzeImage(
    imageSource: string | File,
    suggestedIncidentType?: ReportIncidentType
  ): Promise<VisionAnalysisResult>;
}
