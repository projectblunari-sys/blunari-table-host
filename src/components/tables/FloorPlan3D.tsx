import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, RotateCcw, ZoomIn, ZoomOut, Move3D } from 'lucide-react';

interface Table3DProps {
  position: [number, number, number];
  capacity: number;
  name: string;
  isAvailable: boolean;
}

interface FloorPlanProps {
  floorPlanImage?: string;
  tables: Array<{
    id: string;
    name: string;
    capacity: number;
    position: { x: number; y: number };
    active: boolean;
  }>;
}

// 3D Table Component
const Table3D: React.FC<Table3DProps> = ({ position, capacity, name, isAvailable }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const tableColor = isAvailable ? '#10b981' : '#ef4444';
  const tableSize = Math.max(0.3, capacity * 0.15);

  return (
    <group position={position}>
      {/* Table Base */}
      <Box
        ref={meshRef}
        args={[tableSize, 0.1, tableSize]}
        position={[0, 0.05, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={tableColor} />
      </Box>
      
      {/* Table Top */}
      <Box
        args={[tableSize * 1.1, 0.05, tableSize * 1.1]}
        position={[0, 0.125, 0]}
      >
        <meshStandardMaterial color={hovered ? '#fbbf24' : '#f3f4f6'} />
      </Box>
      
      {/* Table Label */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.1}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      
      {/* Capacity Badge */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.08}
        color="#6b7280"
        anchorX="center"
        anchorY="middle"
      >
        {capacity} seats
      </Text>
    </group>
  );
};

// Floor Plan Plane Component
const FloorPlanPlane: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => {
  const texture = useLoader(TextureLoader, imageUrl || '');
  
  if (!imageUrl) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.8} />
      </mesh>
    );
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial map={texture} transparent opacity={0.9} />
    </mesh>
  );
};

// Main 3D Scene Component
const FloorPlan3D: React.FC<FloorPlanProps> = ({ floorPlanImage, tables }) => {
  return (
    <Canvas
      camera={{ position: [0, 8, 8], fov: 60 }}
      style={{ height: '500px', background: 'linear-gradient(to bottom, #e0f2fe, #f0f9ff)' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} />

      {/* Floor Plan */}
      <FloorPlanPlane imageUrl={floorPlanImage} />

      {/* 3D Tables */}
      {tables.map((table) => (
        <Table3D
          key={table.id}
          position={[
            (table.position.x - 5) * 2, // Convert to 3D coordinates
            0,
            (table.position.y - 5) * 2
          ]}
          capacity={table.capacity}
          name={table.name}
          isAvailable={table.active}
        />
      ))}

      {/* Grid Helper */}
      <gridHelper args={[20, 20, '#cbd5e1', '#e2e8f0']} position={[0, -0.01, 0]} />

      {/* Controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.2}
      />
    </Canvas>
  );
};

// Main Component
export const FloorPlan3DManager: React.FC<{ tables: any[] }> = ({ tables }) => {
  const { toast } = useToast();
  const [floorPlanImage, setFloorPlanImage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFloorPlanImage(imageUrl);
      
      toast({
        title: "Floor plan uploaded!",
        description: "Your 3D floor plan has been updated"
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload floor plan image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const clearFloorPlan = () => {
    setFloorPlanImage('');
    setUploadedFile(null);
    if (floorPlanImage) {
      URL.revokeObjectURL(floorPlanImage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move3D className="w-5 h-5" />
            3D Floor Plan Manager
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
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button
                  onClick={clearFloorPlan}
                  variant="outline"
                  disabled={!floorPlanImage}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant={floorPlanImage ? "default" : "secondary"}>
                {floorPlanImage ? "Floor Plan Active" : "No Floor Plan"}
              </Badge>
              {uploadedFile && (
                <p className="text-sm text-muted-foreground">
                  {uploadedFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• Upload a top-down view of your restaurant floor plan</p>
            <p>• Tables will be positioned on the 3D view</p>
            <p>• Use mouse to rotate, zoom, and pan the view</p>
          </div>
        </CardContent>
      </Card>

      {/* 3D Floor Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive 3D Floor Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <FloorPlan3D floorPlanImage={floorPlanImage} tables={tables} />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Available Tables
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Unavailable Tables
            </Badge>
            <Badge variant="outline">
              <ZoomIn className="w-3 h-3 mr-1" />
              Scroll to Zoom
            </Badge>
            <Badge variant="outline">
              <Move3D className="w-3 h-3 mr-1" />
              Drag to Rotate
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};