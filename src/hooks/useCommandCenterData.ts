import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CommandCenterData, FiltersState, KpiCard, TableRow, Reservation, Policy } from '@/components/command-center/types';

interface UseCommandCenterDataParams {
  tenantId: string;
  date: string; // YYYY-MM-DD
  filters: FiltersState;
}

export function useCommandCenterData({ tenantId, date, filters }: UseCommandCenterDataParams): CommandCenterData {
  // Fetch KPIs
  const { data: kpisData, isLoading: kpisLoading } = useQuery({
    queryKey: ['command-center-kpis', tenantId, date],
    queryFn: async (): Promise<KpiCard[]> => {
      // Mock KPI data for now - replace with actual API calls
      return [
        {
          id: 'occupancy',
          label: 'Occupancy',
          value: '78%',
          sublabel: 'YOY ↑3%',
          tone: 'success',
          spark: [65, 70, 68, 75, 78, 76, 78],
          hint: 'Current table occupancy rate'
        },
        {
          id: 'covers',
          label: 'Covers',
          value: '398%',
          spark: [320, 340, 360, 380, 398, 390, 398],
          hint: 'Total covers served today'
        },
        {
          id: 'no-show-risk',
          label: 'No-Show Risk',
          value: 'Low',
          tone: 'success',
          hint: 'Predicted no-show probability'
        },
        {
          id: 'avg-party',
          label: 'Avg Party',
          value: '2.8',
          spark: [2.5, 2.7, 2.6, 2.8, 2.9, 2.7, 2.8],
          hint: 'Average party size today'
        },
        {
          id: 'kitchen-pacing',
          label: 'Kitchen Pacing',
          value: 'Balanced',
          tone: 'success',
          spark: [60, 65, 62, 68, 65, 63, 65],
          hint: 'Kitchen workload balance'
        }
      ];
    },
    enabled: !!tenantId,
  });

  // Fetch tables - Mock data for now since tables schema may not exist
  const { data: tablesData, isLoading: tablesLoading } = useQuery({
    queryKey: ['command-center-tables', tenantId],
    queryFn: async (): Promise<TableRow[]> => {
      // Mock table data matching the reference image
      return Array.from({ length: 22 }, (_, i) => ({
        id: String(i + 1),
        name: `Table ${i + 1}`,
        section: i < 6 ? 'Patio' : i < 12 ? 'Bar' : 'Main' as 'Patio' | 'Bar' | 'Main',
        capacity: Math.floor(Math.random() * 4) + 2,
        available: Math.random() > 0.3
      }));
    },
    enabled: !!tenantId,
  });

  // Fetch reservations
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['command-center-reservations', tenantId, date, filters],
    queryFn: async (): Promise<Reservation[]> => {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('booking_time', `${date}T00:00:00`)
        .lt('booking_time', `${date}T23:59:59`)
        .order('booking_time');

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters.party?.length) {
        query = query.in('party_size', filters.party);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform to expected format
      return (data || []).map(booking => ({
        id: booking.id,
        guestName: booking.guest_name,
        tableId: booking.table_id || '1',
        section: 'Main' as const, // Default section
        start: booking.booking_time,
        end: new Date(new Date(booking.booking_time).getTime() + (booking.duration_minutes || 90) * 60000).toISOString(),
        partySize: booking.party_size,
        channel: 'WEB' as const, // Default channel
        vip: false, // Default VIP status
        depositRequired: booking.deposit_required || false,
        status: booking.status as 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show',
        specialRequests: booking.special_requests,
        guestPhone: booking.guest_phone,
        guestEmail: booking.guest_email
      }));
    },
    enabled: !!tenantId,
  });

  // Fetch policies
  const { data: policiesData, isLoading: policiesLoading } = useQuery({
    queryKey: ['command-center-policies', tenantId],
    queryFn: async (): Promise<Policy> => {
      // Mock policy data for now - replace with actual API calls
      return {
        depositsEnabled: false // Default to disabled
      };
    },
    enabled: !!tenantId,
  });

  const loading = kpisLoading || tablesLoading || reservationsLoading || policiesLoading;

  return {
    kpis: kpisData || [],
    tables: tablesData || [],
    reservations: reservationsData || [],
    policies: policiesData || { depositsEnabled: false },
    loading,
    error: undefined // Add error handling as needed
  };
}