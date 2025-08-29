import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BookingFilters, ExtendedBooking, BulkOperation } from '@/types/booking';
import { useToast } from '@/hooks/use-toast';

export const useAdvancedBookings = (tenantId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState<BookingFilters>({
    status: [],
    dateRange: { start: '', end: '' },
    sources: [],
    search: ''
  });
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  // Fetch bookings with advanced filtering
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ['advanced-bookings', tenantId, filters],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('tenant_id', tenantId);

      // Apply status filter
      if (filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      // Apply date range filter
      if (filters.dateRange.start) {
        query = query.gte('booking_time', filters.dateRange.start);
      }
      if (filters.dateRange.end) {
        query = query.lte('booking_time', filters.dateRange.end);
      }

      // Apply party size filter
      if (filters.partySize?.min) {
        query = query.gte('party_size', filters.partySize.min);
      }
      if (filters.partySize?.max) {
        query = query.lte('party_size', filters.partySize.max);
      }

      const { data, error } = await query.order('booking_time', { ascending: true });

      if (error) throw error;
      return data as ExtendedBooking[];
    },
    enabled: !!tenantId,
  });

  // Filter bookings by search term
  const filteredBookings = useMemo(() => {
    if (!filters.search) return bookings;
    
    const searchTerm = filters.search.toLowerCase();
    return bookings.filter(booking => 
      booking.guest_name.toLowerCase().includes(searchTerm) ||
      booking.guest_email.toLowerCase().includes(searchTerm) ||
      booking.guest_phone?.includes(searchTerm) ||
      booking.special_requests?.toLowerCase().includes(searchTerm)
    );
  }, [bookings, filters.search]);

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async (operation: BulkOperation) => {
      switch (operation.type) {
        case 'status_update':
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: operation.data.status })
            .in('id', operation.bookingIds);
          if (updateError) throw updateError;
          break;

        case 'send_notification':
          // Call notification edge function
          const { error: notificationError } = await supabase.functions.invoke('send-bulk-notifications', {
            body: { bookingIds: operation.bookingIds, ...operation.data }
          });
          if (notificationError) throw notificationError;
          break;

        case 'export':
          // Generate CSV export
          const bookingsToExport = bookings.filter(b => operation.bookingIds.includes(b.id));
          const csv = generateCSV(bookingsToExport);
          downloadCSV(csv, 'bookings-export.csv');
          break;

        case 'delete':
          const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .in('id', operation.bookingIds);
          if (deleteError) throw deleteError;
          break;
      }
    },
    onSuccess: (_, operation) => {
      queryClient.invalidateQueries({ queryKey: ['advanced-bookings', tenantId] });
      toast({
        title: 'Bulk Operation Complete',
        description: `Successfully processed ${operation.bookingIds.length} bookings.`
      });
      setSelectedBookings([]);
    },
    onError: (error) => {
      toast({
        title: 'Operation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  });

  // Update booking status
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExtendedBooking> }) => {
      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-bookings', tenantId] });
      toast({
        title: 'Booking Updated',
        description: 'Booking has been successfully updated.'
      });
    }
  });

  const generateCSV = (data: ExtendedBooking[]) => {
    const headers = ['Name', 'Email', 'Phone', 'Party Size', 'Date/Time', 'Status', 'Table', 'Special Requests'];
    const rows = data.map(booking => [
      booking.guest_name,
      booking.guest_email,
      booking.guest_phone || '',
      booking.party_size.toString(),
      new Date(booking.booking_time).toLocaleString(),
      booking.status,
      booking.table_id || '',
      booking.special_requests || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    bookings: filteredBookings,
    isLoading,
    error,
    filters,
    setFilters,
    selectedBookings,
    setSelectedBookings,
    bulkOperation: bulkOperationMutation.mutate,
    isBulkOperationPending: bulkOperationMutation.isPending,
    updateBooking: updateBookingMutation.mutate,
    isUpdating: updateBookingMutation.isPending
  };
};