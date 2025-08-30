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
      
      // Try WebGPU first, then fall back to CPU
      try {
        this.detector = await pipeline(
          'object-detection', 
          'Xenova/detr-resnet-50',
          { device: 'webgpu' }
        );
        console.log('AI model initialized with WebGPU successfully');
      } catch (webgpuError) {
        console.warn('WebGPU not available, falling back to CPU:', webgpuError);
        this.detector = await pipeline(
          'object-detection', 
          'Xenova/detr-resnet-50'
        );
        console.log('AI model initialized with CPU successfully');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      throw new Error(`Failed to load AI model: ${error.message}`);
    }
  }

  static async analyzeFloorPlan(imageElement: HTMLImageElement): Promise<FloorPlanAnalysis> {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        console.log('Initializing AI model...');
        await this.initialize();
      }

      console.log('Starting floor plan analysis...');
      console.log('Image dimensions:', imageElement.width, 'x', imageElement.height);
      
      // Ensure image is loaded
      if (!imageElement.complete || imageElement.naturalHeight === 0) {
        throw new Error('Image not properly loaded');
      }

      // Convert image to canvas for better compatibility
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not create canvas context');
      }
      
      canvas.width = imageElement.naturalWidth;
      canvas.height = imageElement.naturalHeight;
      ctx.drawImage(imageElement, 0, 0);
      
      // Get image data URL for the AI model
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      // Detect objects in the image with timeout
      console.log('Running object detection...');
      const detectionPromise = this.detector(imageDataUrl);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Detection timeout')), 30000)
      );
      
      const detections = await Promise.race([detectionPromise, timeoutPromise]);
      console.log('Detection complete. Found objects:', detections?.length || 0);
      console.log('Raw detections:', detections);

      if (!detections || !Array.isArray(detections)) {
        console.warn('Invalid detection results, creating fallback analysis');
        return this.createFallbackAnalysis(startTime);
      }

      // Filter for table-like objects with more flexible criteria
      const tableDetections = detections.filter((detection: any) => {
        const isTable = this.isTableLikeObject(detection.label);
        const hasGoodConfidence = detection.score > 0.1; // Lower threshold
        console.log(`Detection: ${detection.label} (confidence: ${detection.score}) - isTable: ${isTable}`);
        return isTable && hasGoodConfidence;
      });

      console.log(`Found ${tableDetections.length} table-like objects`);

      const detectedTables: DetectedTable[] = tableDetections.map((detection: any, index: number) => {
        const boundingBox = detection.box;
        
        return {
          id: `detected_${index + 1}`,
          name: `Table ${index + 1}`,
          position: {
            x: Math.max(0, Math.min(10, (boundingBox.xmin + boundingBox.xmax) / 2 / imageElement.width * 10)),
            y: Math.max(0, Math.min(10, (boundingBox.ymin + boundingBox.ymax) / 2 / imageElement.height * 10))
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

      console.log('Analysis complete:', {
        tableCount: detectedTables.length,
        confidence: averageConfidence,
        analysisTime
      });

      return {
        tableCount: detectedTables.length,
        detectedTables,
        confidence: averageConfidence,
        recommendations,
        analysisTime
      };
    } catch (error) {
      console.error('Error analyzing floor plan:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Return fallback analysis instead of throwing
      return this.createFallbackAnalysis(startTime, error.message);
    }
  }

  private static createFallbackAnalysis(startTime: number, errorMessage?: string): FloorPlanAnalysis {
    const analysisTime = Date.now() - startTime;
    
    return {
      tableCount: 0,
      detectedTables: [],
      confidence: 0,
      recommendations: [
        "AI analysis encountered an issue. This could be due to:",
        "• Image format not supported (try JPG or PNG)",
        "• Floor plan too complex or unclear",
        "• Network connectivity issues",
        errorMessage ? `• Technical error: ${errorMessage}` : "• Temporary AI service unavailability",
        "You can still manually position tables using the Floor Plan view."
      ],
      analysisTime
    };
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