import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';
import { TenantInfo } from '@/types/booking-api';

interface PartySizeStepProps {
  tenant: TenantInfo;
  onComplete: (data: { party_size: number }) => void;
  loading?: boolean;
}

const PartySizeStep: React.FC<PartySizeStepProps> = ({
  tenant,
  onComplete,
  loading = false
}) => {
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  // Generate party size options (1-12)
  const partySizeOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSizeSelect = (size: number) => {
    setSelectedSize(size);
    // Auto-advance after brief delay for visual feedback
    setTimeout(() => {
      onComplete({ party_size: size });
    }, 300);
  };

  const getSizeIcon = (size: number) => {
    if (size === 1) return '👤';
    if (size === 2) return '👥';
    if (size <= 4) return '👨‍👩‍👦';
    if (size <= 6) return '👨‍👩‍👦‍👦';
    return '👥+';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-lg border-surface-3">
        <CardHeader className="text-center pb-6">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl">
            <Users className="h-6 w-6 text-brand" />
            Party Size
          </CardTitle>
          <p className="text-muted-foreground">
            How many guests will be dining with us?
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {partySizeOptions.map((size) => (
              <motion.button
                key={size}
                onClick={() => handleSizeSelect(size)}
                disabled={loading}
                className={`
                  relative aspect-square rounded-xl border-2 transition-all duration-300
                  hover:scale-105 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${selectedSize === size 
                    ? 'border-brand bg-brand/10 text-brand shadow-lg scale-105' 
                    : 'border-surface-3 hover:border-brand/50 hover:bg-surface/50'
                  }
                `}
                whileHover={{ scale: selectedSize === size ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: size * 0.05, duration: 0.3 }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl mb-1">
                    {getSizeIcon(size)}
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${
                    selectedSize === size ? 'text-brand' : 'text-foreground'
                  }`}>
                    {size}
                  </div>
                  <div className={`text-xs font-medium ${
                    selectedSize === size ? 'text-brand' : 'text-muted-foreground'
                  }`}>
                    {size === 1 ? 'guest' : 'guests'}
                  </div>
                </div>

                {selectedSize === size && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-brand"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Large Group Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <Button
              variant="outline"
              onClick={() => {
                const customSize = prompt('Enter party size (13+ guests):');
                if (customSize && parseInt(customSize) >= 13) {
                  handleSizeSelect(parseInt(customSize));
                }
              }}
              className="text-sm"
            >
              Large group (13+)?
            </Button>
          </motion.div>

          {/* Accessibility hint */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Use keyboard arrows to navigate or click to select
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PartySizeStep;