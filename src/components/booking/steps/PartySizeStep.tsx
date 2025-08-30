import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TenantInfo } from '@/types/booking-api';

interface PartySizeStepProps {
  tenant: TenantInfo;
  onComplete: (data: { party_size: number }) => void;
  loading: boolean;
}

const PartySizeStep: React.FC<PartySizeStepProps> = ({ tenant, onComplete, loading }) => {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [customSize, setCustomSize] = useState<string>('');
  const [showCustom, setShowCustom] = useState(false);

  const standardSizes = [1, 2, 3, 4, 5, 6, 7, 8];
  
  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
    setShowCustom(false);
    // Auto-advance for standard sizes
    setTimeout(() => onComplete({ party_size: size }), 300);
  };

  const handleCustomSubmit = () => {
    const size = parseInt(customSize);
    if (size && size > 0 && size <= 50) {
      setSelectedSize(size);
      onComplete({ party_size: size });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          How many guests?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Standard party sizes */}
        <div className="grid grid-cols-4 gap-3">
          {standardSizes.map((size) => (
            <motion.div key={size} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={selectedSize === size ? "default" : "outline"}
                className="w-full h-16 text-lg font-semibold"
                onClick={() => handleSizeSelect(size)}
                disabled={loading}
                style={{ 
                  backgroundColor: selectedSize === size ? tenant.branding?.primary_color : undefined 
                }}
              >
                {size}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Custom size option */}
        <div className="pt-4 border-t">
          {!showCustom ? (
            <Button
              variant="ghost"
              className="w-full flex items-center gap-2"
              onClick={() => setShowCustom(true)}
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              More than 8 guests?
            </Button>
          ) : (
            <div className="space-y-3">
              <Label htmlFor="custom-size">Custom party size (up to 50)</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-size"
                  type="number"
                  min="9"
                  max="50"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="Enter number of guests"
                  disabled={loading}
                />
                <Button 
                  onClick={handleCustomSubmit}
                  disabled={!customSize || loading}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Helpful info */}
        <div className="text-sm text-muted-foreground text-center">
          Select your party size to see available times
        </div>
      </CardContent>
    </Card>
  );
};

export default PartySizeStep;