'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Box, Plane, Environment, ContactShadows } from '@react-three/drei';
import { useFloorPlanStore } from '@/state/useFloorPlanStore';
import { useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Move3D, RotateCcw, ZoomIn, Eye, Settings, Download, Maximize2 } from 'lucide-react';
import * as THREE from 'three';

function RoundTable({ x, y, r, rotation, label, seats, confidence }: { 
  x: number; 
  y: number; 
  r: number; 
  rotation: number;
  label?: string;
  seats: number;
  confidence?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const tableColor = confidence && confidence > 0.7 ? '#8b4513' : '#a0522d';
  const topColor = hovered ? '#f4d03f' : '#deb887';

  return (
    <group 
      ref={groupRef}
      position={[x - 5, 0, y - 5]} 
      rotation={[0, rotation, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Table Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 1.1, 32]} />
        <meshBasicMaterial color="black" transparent opacity={0.1} />
      </mesh>
      
      {/* Table Base */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[r * 0.9, r, 0.15, 32]} />
        <meshStandardMaterial color={tableColor} />
      </mesh>
      
      {/* Table Top */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[r, r, 0.08, 32]} />
        <meshStandardMaterial color={topColor} roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Table Edge */}
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[r + 0.02, r + 0.02, 0.02, 32]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Chairs */}
      {Array.from({ length: seats }, (_, i) => {
        const angle = (i / seats) * Math.PI * 2;
        const chairDistance = r + 0.3;
        const chairX = Math.cos(angle) * chairDistance;
        const chairZ = Math.sin(angle) * chairDistance;
        
        return (
          <group key={i} position={[chairX, 0, chairZ]} rotation={[0, angle + Math.PI, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.15, 0.4, 0.15]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[0, 0.4, -0.05]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </group>
        );
      })}
      
      {/* Label */}
      {label && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.15}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {label}
        </Text>
      )}
      
      {/* Capacity and confidence */}
      <Text
        position={[0, 0.45, 0]}
        fontSize={0.1}
        color="#7f8c8d"
        anchorX="center"
        anchorY="middle"
      >
        {seats} seats
      </Text>
      
      {confidence && (
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.08}
          color={confidence > 0.7 ? "#27ae60" : "#f39c12"}
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(confidence * 100)}%
        </Text>
      )}
    </group>
  );
}

function RectTable({ x, y, w, h, rotation, label, seats, confidence }: { 
  x: number; 
  y: number; 
  w: number; 
  h: number; 
  rotation: number;
  label?: string;
  seats: number;
  confidence?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current && hovered) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  const tableColor = confidence && confidence > 0.7 ? '#8b4513' : '#a0522d';
  const topColor = hovered ? '#f4d03f' : '#deb887';

  return (
    <group 
      ref={groupRef}
      position={[x - 5, 0, y - 5]} 
      rotation={[0, rotation, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Table Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 1.1, h * 1.1]} />
        <meshBasicMaterial color="black" transparent opacity={0.1} />
      </mesh>
      
      {/* Table Base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[w * 0.95, 0.15, h * 0.95]} />
        <meshStandardMaterial color={tableColor} />
      </mesh>
      
      {/* Table Top */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[w, 0.08, h]} />
        <meshStandardMaterial color={topColor} roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Table Edge */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[w + 0.04, 0.02, h + 0.04]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Chairs */}
      {Array.from({ length: seats }, (_, i) => {
        const perimeter = 2 * (w + h);
        const position = (i / seats) * perimeter;
        let chairX = 0, chairZ = 0, chairRotation = 0;
        
        if (position < w) {
          chairX = position - w/2;
          chairZ = -h/2 - 0.3;
          chairRotation = 0;
        } else if (position < w + h) {
          chairX = w/2 + 0.3;
          chairZ = (position - w) - h/2;
          chairRotation = Math.PI/2;
        } else if (position < 2*w + h) {
          chairX = w/2 - (position - w - h);
          chairZ = h/2 + 0.3;
          chairRotation = Math.PI;
        } else {
          chairX = -w/2 - 0.3;
          chairZ = h/2 - (position - 2*w - h);
          chairRotation = -Math.PI/2;
        }
        
        return (
          <group key={i} position={[chairX, 0, chairZ]} rotation={[0, chairRotation, 0]}>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.15, 0.4, 0.15]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
            <mesh position={[0, 0.4, -0.05]}>
              <boxGeometry args={[0.15, 0.3, 0.05]} />
              <meshStandardMaterial color="#654321" />
            </mesh>
          </group>
        );
      })}
      
      {/* Label */}
      {label && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.15}
          color="#2c3e50"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
      
      {/* Capacity and confidence */}
      <Text
        position={[0, 0.45, 0]}
        fontSize={0.1}
        color="#7f8c8d"
        anchorX="center"
        anchorY="middle"
      >
        {seats} seats
      </Text>
      
      {confidence && (
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.08}
          color={confidence > 0.7 ? "#27ae60" : "#f39c12"}
          anchorX="center"
          anchorY="middle"
        >
          {Math.round(confidence * 100)}%
        </Text>
      )}
    </group>
  );
}

function FloorSurface() {
  return (
    <group>
      {/* Main floor */}
      <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <meshStandardMaterial color="#f8f9fa" roughness={0.8} metalness={0.1} />
      </Plane>
      
      {/* Contact shadows */}
      <ContactShadows 
        opacity={0.3} 
        scale={20} 
        blur={1} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />
    </group>
  );
}

export default function FloorPlanViewer3D() {
  const { entities, uploadedImage } = useFloorPlanStore();
  const [viewMode, setViewMode] = useState<'perspective' | 'top'>('perspective');
  
  const tables = useMemo(() => entities.filter(e => e.type === 'TABLE'), [entities]);
  
  const avgConfidence = useMemo(() => {
    if (tables.length === 0) return 0;
    return tables.reduce((sum, t) => sum + (t.confidence || 0), 0) / tables.length;
  }, [tables]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Move3D className="w-5 h-5" />
            Interactive 3D Floor Plan
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {tables.length} {tables.length === 1 ? 'Table' : 'Tables'}
            </Badge>
            {avgConfidence > 0 && (
              <Badge 
                variant={avgConfidence > 0.7 ? "default" : "secondary"}
                className="text-xs"
              >
                {Math.round(avgConfidence * 100)}% confidence
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'perspective' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('perspective')}
            >
              <Eye className="w-4 h-4 mr-1" />
              3D View
            </Button>
            <Button
              variant={viewMode === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('top')}
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              Top View
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-1" />
              Configure
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="h-[500px] border rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <Canvas 
            camera={
              viewMode === 'perspective' 
                ? { position: [8, 6, 8], fov: 50 }
                : { position: [0, 15, 0], fov: 60 }
            }
            shadows
          >
            {/* Enhanced Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.2} 
              castShadow 
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <pointLight position={[-5, 5, -5]} intensity={0.3} color="#ffeaa7" />
            <pointLight position={[5, 5, 5]} intensity={0.3} color="#74b9ff" />
            
            {/* Environment */}
            <Environment preset="city" />
            
            {/* Floor */}
            <FloorSurface />
            
            {/* Grid */}
            <Grid 
              args={[10, 10]} 
              cellSize={1} 
              infiniteGrid={false} 
              fadeDistance={15} 
              fadeStrength={1}
              cellThickness={0.5}
              sectionThickness={1}
              cellColor="#cbd5e1"
              sectionColor="#94a3b8"
            />
            
            {/* Tables */}
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
                    confidence={t.confidence}
                  />
                );
              }
              const w = t.width ?? 1.2;
              const h = t.height ?? 0.8;
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
                  confidence={t.confidence}
                />
              );
            })}
            
            <OrbitControls 
              enablePan={true}
              enableRotate={true}
              enableZoom={true} 
              minDistance={3}
              maxDistance={25}
              maxPolarAngle={viewMode === 'top' ? 0.1 : Math.PI / 2.1}
              dampingFactor={0.05}
              rotateSpeed={0.5}
              zoomSpeed={0.8}
            />
          </Canvas>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <Badge variant="outline" className="flex items-center gap-1 justify-center py-2">
            <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
            AI Detected
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 justify-center py-2">
            <RotateCcw className="w-3 h-3" />
            Drag to Rotate
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 justify-center py-2">
            <ZoomIn className="w-3 h-3" />
            Scroll to Zoom
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 justify-center py-2">
            <Move3D className="w-3 h-3" />
            Click & Drag
          </Badge>
        </div>
        
        {tables.length === 0 && (
          <div className="mt-6 text-center text-muted-foreground bg-muted/30 p-6 rounded-lg">
            <Move3D className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-1">No Tables Detected</h3>
            <p className="text-sm">Upload and analyze a floor plan to see tables in 3D visualization</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}