import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { TenantInfo, TimeSlot, AvailabilityResponse } from '@/types/booking-api';
import { searchAvailability } from '@/api/booking-proxy';
import { format, addDays, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from 'sonner';

interface DateTimeStepProps {
  tenant: TenantInfo;
  partySize: number;
  onComplete: (data: { slot: TimeSlot }) => void;
  onBack: () => void;
  loading: boolean;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({ 
  tenant, 
  partySize, 
  onComplete, 
  onBack, 
  loading: parentLoading 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezone = tenant.timezone || 'UTC';

  const fetchAvailability = async (date: Date) => {
    setLoadingSlots(true);
    setError(null);
    
    try {
      const searchRequest = {
        tenant_id: tenant.tenant_id,
        party_size: Number(partySize), // Ensure it's a number
        service_date: format(date, 'yyyy-MM-dd'), // Plain date string in YYYY-MM-DD format
      };
      
      console.log('Making availability search request:', searchRequest);
      console.log('Tenant info available:', { 
        tenant_id: tenant.tenant_id, 
        name: tenant.name,
        party_size: partySize,
        selected_date: format(date, 'yyyy-MM-dd')
      });
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout - please try again')), 15000)
      );
      
      const result = await Promise.race([
        searchAvailability(searchRequest),
        timeoutPromise
      ]) as AvailabilityResponse;
      
      console.log('Availability search result:', result);
      setAvailability(result);
      
      if (result && result.slots && result.slots.length === 0) {
        toast('No availability found for this date', {
          description: 'Try selecting a different date or party size'
        });
      }
    } catch (err) {
      const error = err as Error;
      console.error('Availability search failed:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to load availability';
      if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out - please try again';
      } else if (error.message.includes('TENANT_NOT_FOUND')) {
        errorMessage = 'Restaurant configuration not found';
      } else if (error.message.includes('EDGE_FUNCTION_ERROR')) {
        errorMessage = 'Service temporarily unavailable';
      } else if (error.message.includes('NETWORK_ERROR')) {
        errorMessage = 'Network connection issue';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error('Failed to load availability', {
        description: errorMessage
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate, partySize, tenant.tenant_id]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    onComplete({ slot });
  };

  const formatSlotTime = (timeISO: string) => {
    return formatInTimeZone(parseISO(timeISO), timezone, 'h:mm a');
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select Date & Time
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Party of {partySize} • {tenant.name}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Date picker */}
          <div>
            <h3 className="font-medium mb-4">Choose a date</h3>
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                fromDate={new Date()}
                toDate={addDays(new Date(), 60)}
                className="rounded-lg border shadow-sm w-full max-w-sm bg-card"
                showOutsideDays={false}
              />
            </div>
          </div>

          {/* Time slots */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Available times</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchAvailability(selectedDate)}
                disabled={loadingSlots}
              >
                <RefreshCw className={`w-4 h-4 ${loadingSlots ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {loadingSlots ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-2">Failed to load availability</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fetchAvailability(selectedDate)}
                >
                  Try Again
                </Button>
              </div>
            ) : !availability || availability.slots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No availability for this date</p>
                <p className="text-sm">Try selecting a different date</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main slots with compact cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availability.slots.map((slot, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      disabled={parentLoading}
                      className="relative p-4 rounded-xl border-2 border-surface-3 hover:border-brand/50 bg-surface/50 hover:bg-surface transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      {/* Time Display */}
                      <div className="text-center mb-3">
                        <div className="text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                          {formatSlotTime(slot.time)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot.available_tables} available
                        </div>
                      </div>

                      {/* Badges - Only show if API provides these flags */}
                      <div className="flex flex-wrap justify-center gap-1">
                        {slot.optimal && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-0.5 bg-success/10 text-success border-success/20"
                          >
                            <TrendingUp className="w-2.5 h-2.5 mr-1" />
                            Optimal
                          </Badge>
                        )}
                        {slot.revenue_projection && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 bg-warning/10 text-warning border-warning/20"
                          >
                            💰 High Value
                          </Badge>
                        )}
                        {slot.available_tables <= 2 && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive border-destructive/20"
                          >
                            ⚡ Limited
                          </Badge>
                        )}
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 rounded-xl bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                  ))}
                </div>

                {/* Alternative times if provided by API */}
                {availability.alternatives && availability.alternatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                      Alternative times
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availability.alternatives.map((slot, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full h-auto p-3 flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleSlotSelect(slot)}
                          disabled={parentLoading}
                        >
                          <div className="font-medium">
                            {formatSlotTime(slot.time)}
                          </div>
                          <div className="text-xs">
                            {slot.available_tables} available
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Back button */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack} disabled={parentLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Change Party Size
        </Button>
      </div>
    </div>
  );
};

export default DateTimeStep;