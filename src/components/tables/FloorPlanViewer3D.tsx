'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Box } from '@react-three/drei';
import { useFloorPlanStore } from '@/state/useFloorPlanStore';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Move3D, RotateCcw, ZoomIn } from 'lucide-react';

function RoundTable({ x, y, r, rotation, label, seats }: { 
  x: number; 
  y: number; 
  r: number; 
  rotation: number;
  label?: string;
  seats: number;
}) {
  return (
    <group position={[x, 0.1, y]} rotation={[0, rotation, 0]}>
      {/* Table Base */}
      <mesh>
        <cylinderGeometry args={[r, r, 0.2, 32]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Table Top */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[r * 0.9, r * 0.9, 0.05, 32]} />
        <meshStandardMaterial color="#deb887" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
      
      {/* Capacity */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.15}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {seats} seats
      </Text>
    </group>
  );
}

function RectTable({ x, y, w, h, rotation, label, seats }: { 
  x: number; 
  y: number; 
  w: number; 
  h: number; 
  rotation: number;
  label?: string;
  seats: number;
}) {
  return (
    <group position={[x, 0.1, y]} rotation={[0, rotation, 0]}>
      {/* Table Base */}
      <mesh>
        <boxGeometry args={[w, 0.2, h]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Table Top */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[w * 0.95, 0.05, h * 0.95]} />
        <meshStandardMaterial color="#deb887" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.2}
          color="#333333"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
      
      {/* Capacity */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.15}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        {seats} seats
      </Text>
    </group>
  );
}

export default function FloorPlanViewer3D() {
  const { entities } = useFloorPlanStore();

  const tables = useMemo(() => entities.filter(e => e.type === 'TABLE'), [entities]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Move3D className="w-5 h-5" />
            Interactive 3D Floor Plan
          </span>
          <Badge variant="outline">
            {tables.length} {tables.length === 1 ? 'Table' : 'Tables'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[480px] border rounded overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
          <Canvas camera={{ position: [5, 8, 12], fov: 45 }}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
            <pointLight position={[0, 10, 0]} intensity={0.3} />
            
            {/* Grid floor */}
            <Grid args={[10, 10]} cellSize={1} infiniteGrid={false} fadeDistance={30} />
            
            {/* Floor plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
              <planeGeometry args={[10, 10]} />
              <meshStandardMaterial color="#f8fafc" transparent opacity={0.8} />
            </mesh>
            
            {/* Render tables */}
            {tables.map((t, i) => {
              if (t.shape === 'ROUND' && t.radius) {
                return (
                  <RoundTable 
                    key={i} 
                    x={t.x} 
                    y={t.y} 
                    r={t.radius} 
                    rotation={t.rotation} 
                    label={t.label}
                    seats={t.seats}
                  />
                );
              }
              const w = t.width ?? 1;
              const h = t.height ?? 1;
              return (
                <RectTable 
                  key={i} 
                  x={t.x} 
                  y={t.y} 
                  w={w} 
                  h={h} 
                  rotation={t.rotation}
                  label={t.label}
                  seats={t.seats}
                />
              );
            })}
            
            <OrbitControls 
              enablePan 
              enableRotate 
              enableZoom 
              minDistance={3}
              maxDistance={20}
              maxPolarAngle={Math.PI / 2.2}
            />
          </Canvas>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            Detected Tables
          </Badge>
          <Badge variant="outline">
            <RotateCcw className="w-3 h-3 mr-1" />
            Drag to Rotate
          </Badge>
          <Badge variant="outline">
            <ZoomIn className="w-3 h-3 mr-1" />
            Scroll to Zoom
          </Badge>
          <Badge variant="outline">
            <Move3D className="w-3 h-3 mr-1" />
            Click & Drag
          </Badge>
        </div>
        
        {tables.length === 0 && (
          <div className="mt-4 text-center text-muted-foreground">
            <p>Upload and analyze a floor plan to see tables in 3D</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}