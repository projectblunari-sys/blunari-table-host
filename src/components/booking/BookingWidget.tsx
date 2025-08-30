import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BookingState, TenantInfo, TimeSlot, GuestDetails } from '@/types/booking-api';
import { sendAnalyticsEvent } from '@/api/booking-proxy';
import PartySizeStep from './steps/PartySizeStep';
import DateTimeStep from './steps/DateTimeStep';
import GuestDetailsStep from './steps/GuestDetailsStep';
import ConfirmationStep from './steps/ConfirmationStep';
import BookingTimer from './BookingTimer';
import ErrorBoundary from './ErrorBoundary';

interface BookingWidgetProps {
  slug: string;
  tenant: TenantInfo;
  onError?: (error: Error) => void;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ slug, tenant, onError }) => {
  const [state, setState] = useState<BookingState>({
    step: 1,
    tenant,
    party_size: null,
    selected_slot: null,
    hold: null,
    guest_details: null,
    policies: null,
    start_time: Date.now(),
    step_times: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track step completion times for gamification
  const recordStepTime = useCallback(() => {
    const stepTime = Date.now() - (state.step_times.reduce((a, b) => a + b, 0) + state.start_time);
    setState(prev => ({
      ...prev,
      step_times: [...prev.step_times, stepTime],
    }));
  }, [state.step_times, state.start_time]);

  // Analytics tracking
  useEffect(() => {
    sendAnalyticsEvent('booking_started', {
      tenant_id: tenant.tenant_id,
      slug,
      timestamp: state.start_time,
    });
  }, [tenant.tenant_id, slug, state.start_time]);

  const handleStepComplete = useCallback(async (stepData: any) => {
    recordStepTime();
    
    try {
      setLoading(true);
      setError(null);

      switch (state.step) {
        case 1:
          setState(prev => ({ 
            ...prev, 
            party_size: stepData.party_size, 
            step: 2 
          }));
          await sendAnalyticsEvent('step_completed', {
            step: 1,
            party_size: stepData.party_size,
            tenant_id: tenant.tenant_id,
          });
          break;

        case 2:
          setState(prev => ({ 
            ...prev, 
            selected_slot: stepData.slot, 
            step: 3 
          }));
          await sendAnalyticsEvent('step_completed', {
            step: 2,
            slot_time: stepData.slot.time,
            optimal_selected: stepData.slot.optimal || false,
            tenant_id: tenant.tenant_id,
          });
          if (stepData.slot.optimal) {
            await sendAnalyticsEvent('optimal_slot_selected', {
              slot_time: stepData.slot.time,
              tenant_id: tenant.tenant_id,
            });
          }
          break;

        case 3:
          setState(prev => ({ 
            ...prev, 
            guest_details: stepData.guest_details, 
            step: 4 
          }));
          await sendAnalyticsEvent('step_completed', {
            step: 3,
            tenant_id: tenant.tenant_id,
          });
          break;
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError?.(error);
      toast.error('Step completion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [state.step, tenant.tenant_id, recordStepTime, onError]);

  const handleBookingComplete = useCallback(async (reservation: any) => {
    const totalTime = Date.now() - state.start_time;
    
    await sendAnalyticsEvent('booking_completed', {
      reservation_id: reservation.reservation_id,
      total_time_ms: totalTime,
      step_times: state.step_times,
      tenant_id: tenant.tenant_id,
    });

    // Local achievement tracking (no backend data)
    const achievements = [];
    if (totalTime < 60000) achievements.push('Speed Demon'); // Under 1 minute
    if (totalTime < 120000) achievements.push('Quick Booker'); // Under 2 minutes
    if (state.selected_slot?.optimal) achievements.push('Optimizer');

    if (achievements.length > 0) {
      toast.success(`🎉 Achievement${achievements.length > 1 ? 's' : ''} unlocked: ${achievements.join(', ')}`);
    }
  }, [state.start_time, state.step_times, state.selected_slot, tenant.tenant_id]);

  const handleBookingError = useCallback(async (error: Error) => {
    await sendAnalyticsEvent('booking_failed', {
      error_message: error.message,
      step: state.step,
      tenant_id: tenant.tenant_id,
    });
    
    setError(error.message);
    onError?.(error);
  }, [state.step, tenant.tenant_id, onError]);

  const handleBack = useCallback(() => {
    if (state.step > 1) {
      setState(prev => ({ ...prev, step: (prev.step - 1) as 1 | 2 | 3 | 4 }));
    }
  }, [state.step]);

  const progressPercentage = (state.step / 4) * 100;

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Booking Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => setError(null)}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <div className="max-w-2xl mx-auto p-4">
        {/* Header with branding */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2"
              style={{ color: tenant.branding?.primary_color }}>
            Book a Table at {tenant.name}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <BookingTimer startTime={state.start_time} />
            </div>
            <Badge variant="outline">Step {state.step} of 4</Badge>
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercentage} className="mb-8" />

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {state.step === 1 && (
              <PartySizeStep
                tenant={tenant}
                onComplete={handleStepComplete}
                loading={loading}
              />
            )}
            
            {state.step === 2 && (
              <DateTimeStep
                tenant={tenant}
                partySize={state.party_size!}
                onComplete={handleStepComplete}
                onBack={handleBack}
                loading={loading}
              />
            )}
            
            {state.step === 3 && (
              <GuestDetailsStep
                tenant={tenant}
                onComplete={handleStepComplete}
                onBack={handleBack}
                loading={loading}
              />
            )}
            
            {state.step === 4 && (
              <ConfirmationStep
                state={state}
                onComplete={handleBookingComplete}
                onError={handleBookingError}
                onBack={handleBack}
                loading={loading}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          Powered by Real-Time Booking System
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BookingWidget;