import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Booking {
  id: string;
  tenant_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  party_size: number;
  booking_time: string;
  duration_minutes: number;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  table_id?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export const useRealtimeBookings = (tenantId?: string) => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch bookings
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('booking_time', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!tenantId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel('tenant-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          // Invalidate and refetch bookings when changes occur
          queryClient.invalidateQueries({ queryKey: ['bookings', tenantId] });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [tenantId, queryClient]);

  return {
    bookings,
    isLoading,
    error,
    isConnected,
  };
};

export const useTodaysBookings = (tenantId?: string) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['bookings', 'today', tenantId, today],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('booking_time', `${today}T00:00:00`)
        .lt('booking_time', `${today}T23:59:59`)
        .order('booking_time', { ascending: true });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!tenantId,
  });

  return {
    bookings,
    isLoading,
    error,
  };
};