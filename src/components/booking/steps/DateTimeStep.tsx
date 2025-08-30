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
      
      const result = await searchAvailability(searchRequest);
      console.log('Availability search result:', result);
      setAvailability(result);
      
      if (result.slots.length === 0) {
        toast('No availability found for this date', {
          description: 'Try selecting a different date or party size'
        });
      }
    } catch (err) {
      const error = err as Error;
      console.error('Availability search failed:', error);
      setError(error.message);
      toast.error('Failed to load availability: ' + error.message);
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
                {/* Main slots */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availability.slots.map((slot, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-accent/50 transition-colors"
                        onClick={() => handleSlotSelect(slot)}
                        disabled={parentLoading}
                      >
                        <div className="font-semibold text-base">
                          {formatSlotTime(slot.time)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot.available_tables} table{slot.available_tables !== 1 ? 's' : ''}
                        </div>
                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                          {slot.optimal && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Optimal
                            </Badge>
                          )}
                          {slot.revenue_projection && (
                            <Badge variant="outline" className="text-xs px-2 py-1">
                              ${slot.revenue_projection}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </motion.div>
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