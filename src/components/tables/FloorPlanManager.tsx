'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useFloorPlanStore } from '@/state/useFloorPlanStore';
import { WORLD_W, WORLD_H } from '@/lib/floorplan/normalize';
import { AnalyzeResponseSchema } from '@/lib/floorplan/schema';
import { FloorPlanAI } from '@/services/FloorPlanAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Upload, Brain, RotateCcw, CheckCircle2, AlertTriangle, Camera, Zap } from 'lucide-react';

export default function FloorPlanManager() {
  const [file, setFile] = useState<File | null>(null);
  const { 
    entities, 
    runId, 
    isAnalyzing, 
    uploadedImage,
    setRun, 
    setAnalyzing, 
    setUploadedImage,
    reset 
  } = useFloorPlanStore();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    setFile(selectedFile);
    
    // Create preview URL
    const imageUrl = URL.createObjectURL(selectedFile);
    setUploadedImage(imageUrl);
    
    toast.success('Image uploaded! Ready for analysis');
  }, [setUploadedImage]);

  const analyzeFloorPlan = useCallback(async () => {
    if (!file || !uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    console.log('[FloorPlanManager] Starting analysis...');
    setAnalyzing(true);
    
    try {
      // Create image element for AI analysis
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = uploadedImage;
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // Use existing FloorPlanAI service
      const analysisResult = await FloorPlanAI.analyzeFloorPlan(img);
      
      // Convert to our schema format with better distribution
      const runId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      
      // If we have many tables detected, distribute them better across the space
      const entities = analysisResult.detectedTables.map((table, index) => {
        // Use the AI detected positions but ensure good distribution
        let x = table.position.x;
        let y = table.position.y;
        
        // If positions are too clustered (common AI issue), spread them out
        if (analysisResult.tableCount > 3) {
          const gridSize = Math.ceil(Math.sqrt(analysisResult.tableCount));
          const spacing = 8 / gridSize; // Leave margins
          const baseX = 1 + (index % gridSize) * spacing;
          const baseY = 1 + Math.floor(index / gridSize) * spacing;
          
          // Blend AI position with grid distribution (70% AI, 30% grid)
          x = x * 0.7 + baseX * 0.3;
          y = y * 0.7 + baseY * 0.3;
        }

        return {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36) + index,
          type: 'TABLE' as const,
          shape: table.estimatedCapacity > 6 ? 'RECT' as const : 'ROUND' as const,
          x: Math.max(0.5, Math.min(9.5, x)), // Ensure tables stay within bounds
          y: Math.max(0.5, Math.min(9.5, y)),
          radius: table.estimatedCapacity > 6 ? undefined : Math.max(0.3, Math.min(0.8, table.estimatedCapacity * 0.1 + 0.3)),
          width: table.estimatedCapacity > 6 ? Math.max(0.8, Math.min(2.0, table.estimatedCapacity * 0.15 + 0.5)) : undefined,
          height: table.estimatedCapacity > 6 ? Math.max(0.6, Math.min(1.2, table.estimatedCapacity * 0.1 + 0.4)) : undefined,
          rotation: Math.random() * Math.PI * 0.5, // Small random rotation for realism
          seats: Math.max(2, Math.min(12, table.estimatedCapacity)),
          label: table.name || `Table ${index + 1}`,
          confidence: table.confidence,
          meta: {}
        };
      });

      const preview = {
        imgWidth: img.naturalWidth,
        imgHeight: img.naturalHeight,
        worldWidth: WORLD_W,
        worldHeight: WORLD_H
      };

      setRun(runId, entities, preview);
      
      if (analysisResult.tableCount > 0) {
        toast.success(`Analysis complete! Detected ${analysisResult.tableCount} tables`);
      } else {
        toast('No tables detected', {
          description: 'Try a clearer image or manually position tables'
        });
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again or position tables manually.');
    } finally {
      setAnalyzing(false);
    }
  }, [file, uploadedImage, setAnalyzing, setRun]);

  const clearFloorPlan = useCallback(() => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    setFile(null);
    reset();
    toast('Floor plan cleared');
  }, [uploadedImage, reset]);

  const hasAnalysis = runId && entities.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Floor Plan from Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="floorplan-upload">Upload Floor Plan Image</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="floorplan-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isAnalyzing}
                className="flex-1"
              />
              <Button
                onClick={clearFloorPlan}
                variant="outline"
                disabled={!uploadedImage && !hasAnalysis}
                size="sm"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge variant={uploadedImage ? "default" : "secondary"}>
              {uploadedImage ? "Image Ready" : "No Image"}
            </Badge>
            {file && (
              <p className="text-sm text-muted-foreground">
                {file.name}
              </p>
            )}
          </div>
        </div>

        {!uploadedImage ? (
          <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4" />
              <span className="font-medium">Upload Instructions</span>
            </div>
            <ul className="space-y-1">
              <li>• Upload a clear top-down photo or sketch of your restaurant floor plan</li>
              <li>• Ensure tables are clearly visible and not obstructed</li>
              <li>• Best results with good lighting and minimal shadows</li>
              <li>• AI will automatically detect tables and estimate seating capacity</li>
            </ul>
          </div>
        ) : !hasAnalysis ? (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Ready for AI Analysis
              </h4>
              <Button 
                onClick={analyzeFloorPlan}
                disabled={isAnalyzing}
                size="sm"
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <Spinner size="sm" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Floor Plan'}
              </Button>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>🤖 GPT-4 Vision will analyze your floor plan</p>
              <p>📊 Detect tables and estimate seating capacity</p>
              <p>🎯 Generate interactive 3D visualization</p>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Analysis Complete
              </h4>
              <Button 
                onClick={analyzeFloorPlan}
                disabled={isAnalyzing}
                size="sm"
                variant="outline"
              >
                Re-analyze
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{entities.length}</div>
                <div className="text-xs text-muted-foreground">Tables Detected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((entities.reduce((sum, e) => sum + (e.confidence || 0), 0) / Math.max(1, entities.length)) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {entities.reduce((sum, e) => sum + e.seats, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Capacity</div>
              </div>
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Tables mapped to 3D coordinates and ready for visualization</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <span>World coordinates: {WORLD_W}×{WORLD_H} units</span>
        </div>
      </CardContent>
    </Card>
  );
}