'use client';

import { useEffect, useRef } from 'react';
import { useFloorPlanStore } from '@/state/useFloorPlanStore';
import { WORLD_W, WORLD_H } from '@/lib/floorplan/normalize';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function FloorPlanViewer2D() {
  const { entities, uploadedImage } = useFloorPlanStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, W, H);

    // Draw background image if available
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.drawImage(img, 0, 0, W, H);
        ctx.restore();
        drawOverlay();
      };
      img.src = uploadedImage;
    } else {
      drawOverlay();
    }

    function drawOverlay() {
      if (!ctx) return;
      
      // Draw grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= WORLD_W; i++) {
        const x = (i / WORLD_W) * W;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let j = 0; j <= WORLD_H; j++) {
        const y = (j / WORLD_H) * H;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Draw tables
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      
      entities.filter(e => e.type === 'TABLE').forEach((e, index) => {
        const x = (e.x / WORLD_W) * W;
        const y = (e.y / WORLD_H) * H;
        
        if (e.shape === 'ROUND' && e.radius) {
          const r = (e.radius / WORLD_W) * W;
          ctx.beginPath();
          ctx.arc(x, H - y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          const w = ((e.width ?? 1) / WORLD_W) * W;
          const h = ((e.height ?? 1) / WORLD_H) * H;
          ctx.fillRect(x - w/2, H - (y + h/2), w, h);
          ctx.strokeRect(x - w/2, H - (y + h/2), w, h);
        }

        // Draw table label
        if (e.label) {
          ctx.fillStyle = '#1f2937';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(e.label, x, H - y + 4);
          ctx.fillStyle = '#f59e0b';
        }
      });
    }
  }, [entities, uploadedImage]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">2D Floor Plan View</h4>
          <Badge variant="outline">
            {entities.filter(e => e.type === 'TABLE').length} Tables
          </Badge>
        </div>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={400} 
          className="border rounded w-full h-[320px] bg-gray-50 dark:bg-gray-900" 
        />
        <p className="text-xs text-muted-foreground mt-2">
          Orange circles/rectangles represent detected tables overlaid on your floor plan
        </p>
      </CardContent>
    </Card>
  );
}