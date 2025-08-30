import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface DetectedTable {
  id: string;
  name: string;
  position: { x: number; y: number };
  confidence: number;
  boundingBox: { x: number; y: number; width: number; height: number };
  estimatedCapacity: number;
}

export interface FloorPlanAnalysis {
  tableCount: number;
  detectedTables: DetectedTable[];
  confidence: number;
  recommendations: string[];
  analysisTime: number;
}

export class FloorPlanAI {
  private static detector: any = null;
  private static isInitialized = false;

  static async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing AI object detection model...');
      this.detector = await pipeline(
        'object-detection', 
        'Xenova/detr-resnet-50',
        { device: 'webgpu' }
      );
      this.isInitialized = true;
      console.log('AI model initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU');
      this.detector = await pipeline(
        'object-detection', 
        'Xenova/detr-resnet-50'
      );
      this.isInitialized = true;
    }
  }

  static async analyzeFloorPlan(imageElement: HTMLImageElement): Promise<FloorPlanAnalysis> {
    const startTime = Date.now();
    
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('Analyzing floor plan for tables...');
      
      // Detect objects in the image
      const detections = await this.detector(imageElement);
      console.log('Raw detections:', detections);

      // Filter for table-like objects
      const tableDetections = detections.filter((detection: any) => 
        this.isTableLikeObject(detection.label)
      );

      const detectedTables: DetectedTable[] = tableDetections.map((detection: any, index: number) => {
        const boundingBox = detection.box;
        
        return {
          id: `detected_${index + 1}`,
          name: `Table ${index + 1}`,
          position: {
            x: (boundingBox.xmin + boundingBox.xmax) / 2 / imageElement.width * 10,
            y: (boundingBox.ymin + boundingBox.ymax) / 2 / imageElement.height * 10
          },
          confidence: detection.score,
          boundingBox: {
            x: boundingBox.xmin,
            y: boundingBox.ymin,
            width: boundingBox.xmax - boundingBox.xmin,
            height: boundingBox.ymax - boundingBox.ymin
          },
          estimatedCapacity: this.estimateTableCapacity(boundingBox)
        };
      });

      const analysisTime = Date.now() - startTime;
      const averageConfidence = detectedTables.length > 0 
        ? detectedTables.reduce((sum, table) => sum + table.confidence, 0) / detectedTables.length 
        : 0;

      const recommendations = this.generateRecommendations(detectedTables, imageElement);

      return {
        tableCount: detectedTables.length,
        detectedTables,
        confidence: averageConfidence,
        recommendations,
        analysisTime
      };
    } catch (error) {
      console.error('Error analyzing floor plan:', error);
      throw new Error('Failed to analyze floor plan. Please try again.');
    }
  }

  private static isTableLikeObject(label: string): boolean {
    const tableKeywords = [
      'dining table', 'table', 'desk', 'bench', 'chair',
      'furniture', 'couch', 'sofa'
    ];
    
    return tableKeywords.some(keyword => 
      label.toLowerCase().includes(keyword)
    );
  }

  private static estimateTableCapacity(boundingBox: any): number {
    // Estimate capacity based on bounding box size
    const area = (boundingBox.xmax - boundingBox.xmin) * (boundingBox.ymax - boundingBox.ymin);
    
    if (area < 1000) return 2;
    if (area < 2500) return 4;
    if (area < 5000) return 6;
    return 8;
  }

  private static generateRecommendations(tables: DetectedTable[], image: HTMLImageElement): string[] {
    const recommendations: string[] = [];
    
    if (tables.length === 0) {
      recommendations.push("No tables detected. Try uploading a clearer floor plan image.");
      recommendations.push("Ensure tables are clearly visible and not obstructed by other objects.");
    } else {
      recommendations.push(`Successfully detected ${tables.length} tables.`);
      
      const lowConfidenceTables = tables.filter(t => t.confidence < 0.5);
      if (lowConfidenceTables.length > 0) {
        recommendations.push(`${lowConfidenceTables.length} tables detected with low confidence. Manual verification recommended.`);
      }
      
      const totalCapacity = tables.reduce((sum, table) => sum + table.estimatedCapacity, 0);
      recommendations.push(`Estimated total seating capacity: ${totalCapacity} guests.`);
      
      if (tables.length < 5) {
        recommendations.push("Consider optimizing your layout for more tables if space allows.");
      }
    }
    
    return recommendations;
  }
}