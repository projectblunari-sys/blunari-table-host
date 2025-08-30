import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Calendar, CheckCircle, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { BookingState, TenantInfo, TimeSlot, GuestDetails } from '@/types/booking-api';
import { sendAnalyticsEvent, getTenantBySlug } from '@/api/booking-proxy';
import PartySizeStep from './steps/PartySizeStep';
import DateTimeStep from './steps/DateTimeStep';
import GuestDetailsStep from './steps/GuestDetailsStep';
import ConfirmationStep from './steps/ConfirmationStep';
import BookingTimer from './BookingTimer';
import ErrorBoundary from './ErrorBoundary';

interface BookingWidgetProps {
  slug: string;
  onError?: (error: Error) => void;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ slug, onError }) => {
  const [tenantLoading, setTenantLoading] = useState(true);
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  
  const [state, setState] = useState<BookingState>({
    step: 1,
    tenant: null,
    party_size: null,
    selected_slot: null,
    hold: null,
    guest_details: null,
    policies: null,
    start_time: Date.now(),
    step_times: [],
  });
  
  const [stepLoading, setStepLoading] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);

  // Load tenant info on mount
  useEffect(() => {
    const loadTenant = async () => {
      try {
        setTenantLoading(true);
        setTenantError(null);
        
        const tenantInfo = await getTenantBySlug(slug);
        setTenant(tenantInfo);
        setState(prev => ({ ...prev, tenant: tenantInfo }));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load restaurant information';
        setTenantError(errorMsg);
        onError?.(err instanceof Error ? err : new Error(errorMsg));
      } finally {
        setTenantLoading(false);
      }
    };

    loadTenant();
  }, [slug, onError]);

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
    if (tenant) {
      sendAnalyticsEvent('booking_started', {
        tenant_id: tenant.tenant_id,
        slug,
        timestamp: state.start_time,
      });
    }
  }, [tenant, slug, state.start_time]);

  const handleStepComplete = useCallback(async (stepData: any) => {
    if (!tenant) return;
    
    recordStepTime();
    
    try {
      setStepLoading(true);
      setStepError(null);

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
      setStepError(error.message);
      onError?.(error);
      toast.error('Step completion failed. Please try again.');
    } finally {
      setStepLoading(false);
    }
  }, [state.step, tenant, recordStepTime, onError]);

  const handleBookingComplete = useCallback(async (reservation: any) => {
    if (!tenant) return;
    
    const totalTime = Date.now() - state.start_time;
    
    await sendAnalyticsEvent('booking_completed', {
      reservation_id: reservation.reservation_id,
      total_time_ms: totalTime,
      step_times: state.step_times,
      tenant_id: tenant.tenant_id,
    });

    // Local achievement tracking (no backend data)
    const newAchievements = [];
    if (totalTime < 60000) newAchievements.push('Speed Demon'); // Under 1 minute
    if (totalTime < 120000) newAchievements.push('Quick Booker'); // Under 2 minutes
    if (state.selected_slot?.optimal) newAchievements.push('Optimizer');

    setAchievements(newAchievements);

    if (newAchievements.length > 0) {
      toast.success(`🎉 Achievement${newAchievements.length > 1 ? 's' : ''} unlocked: ${newAchievements.join(', ')}`);
    }
  }, [state.start_time, state.step_times, state.selected_slot, tenant]);

  const handleBookingError = useCallback(async (error: Error) => {
    if (!tenant) return;
    
    await sendAnalyticsEvent('booking_failed', {
      error_message: error.message,
      step: state.step,
      tenant_id: tenant.tenant_id,
    });
    
    setStepError(error.message);
    onError?.(error);
  }, [state.step, tenant, onError]);

  const handleBack = useCallback(() => {
    if (state.step > 1) {
      setState(prev => ({ ...prev, step: (prev.step - 1) as 1 | 2 | 3 | 4 }));
      setStepError(null);
    }
  }, [state.step]);

  const progressPercentage = (state.step / 4) * 100;

  const stepTitles = {
    1: 'Party Size',
    2: 'Date & Time',
    3: 'Guest Details',
    4: 'Confirmation'
  };

  // Enhanced loading state
  if (tenantLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Loading Restaurant</h2>
            <p className="text-muted-foreground">
              Please wait while we prepare your booking experience...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enhanced error state
  if (tenantError || !tenant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
            <h2 className="text-xl font-semibold mb-3">Restaurant Unavailable</h2>
            <p className="text-muted-foreground mb-6">
              {tenantError || 'We couldn\'t load the restaurant information. This might be temporary.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stepError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-destructive/20">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Booking Error</h3>
            <p className="text-muted-foreground mb-6">{stepError}</p>
            <div className="space-y-3">
              <Button onClick={() => setStepError(null)} className="w-full">
                Try Again
              </Button>
              {state.step > 1 && (
                <Button variant="outline" onClick={handleBack} className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={onError}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-4xl mx-auto p-4 pt-8">
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {tenant.name}
              </h1>
              <p className="text-lg text-muted-foreground">Reserve your table in just a few steps</p>
            </div>

            {/* Progress Section */}
            <Card className="max-w-2xl mx-auto shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <BookingTimer startTime={state.start_time} />
                  </div>
                  <Badge variant="secondary" className="font-medium">
                    Step {state.step} of 4: {stepTitles[state.step as keyof typeof stepTitles]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Progress value={progressPercentage} className="h-2" />
                
                {/* Step indicators */}
                <div className="flex justify-between mt-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step}
                      className={`flex flex-col items-center text-xs ${
                        step <= state.step ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                        step < state.step 
                          ? 'bg-primary text-primary-foreground' 
                          : step === state.step 
                            ? 'bg-primary/20 text-primary border-2 border-primary' 
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        {step < state.step ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <span className="font-medium">{step}</span>
                        )}
                      </div>
                      <span className="font-medium">{stepTitles[step as keyof typeof stepTitles]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step Content */}
          <div className="max-w-2xl mx-auto">
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
                    loading={stepLoading}
                  />
                )}
                
                {state.step === 2 && (
                  <DateTimeStep
                    tenant={tenant}
                    partySize={state.party_size!}
                    onComplete={handleStepComplete}
                    onBack={handleBack}
                    loading={stepLoading}
                  />
                )}
                
                {state.step === 3 && (
                  <GuestDetailsStep
                    tenant={tenant}
                    onComplete={handleStepComplete}
                    onBack={handleBack}
                    loading={stepLoading}
                  />
                )}
                
                {state.step === 4 && (
                  <ConfirmationStep
                    state={state}
                    onComplete={handleBookingComplete}
                    onError={handleBookingError}
                    onBack={handleBack}
                    loading={stepLoading}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12 pb-8"
          >
            <Separator className="mb-6" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Powered by <span className="font-medium text-foreground">Real-Time Booking System</span></p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <span>🔒 Secure & Private</span>
                <span>⚡ Instant Confirmation</span>
                <span>📱 Mobile Optimized</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BookingWidget;