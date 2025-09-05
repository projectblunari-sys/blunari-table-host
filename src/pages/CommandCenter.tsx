import { useState } from 'react';
import { TopBar } from '@/components/command-center/TopBar';
import { KpiStrip } from '@/components/command-center/KpiStrip';
import { Filters } from '@/components/command-center/Filters';
import { MainSplit } from '@/components/command-center/MainSplit';
import { ReservationDrawer } from '@/components/command-center/ReservationDrawer';
import { useCommandCenterData } from '@/hooks/useCommandCenterData';
import { useTenant } from '@/hooks/useTenant';
import type { FiltersState, Reservation } from '@/components/command-center/types';

export default function CommandCenter() {
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filters, setFilters] = useState<FiltersState>({});
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [focusTableId, setFocusTableId] = useState<string>();

  const { 
    kpis, 
    tables, 
    reservations, 
    policies, 
    loading, 
    error 
  } = useCommandCenterData({
    tenantId: tenant?.id || '',
    date: selectedDate.toISOString().split('T')[0],
    filters
  });

  const handleReservationSelect = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDrawerOpen(true);
  };

  const handleTableFocus = (tableId: string) => {
    setFocusTableId(tableId);
  };

  return (
    <main 
      aria-label="Bookings Command Center" 
      className="min-h-screen bg-[hsl(var(--bg))] p-6 space-y-6"
    >
      <h1 className="sr-only">Bookings Command Center</h1>
      
      <TopBar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        loading={loading}
      />

      <KpiStrip 
        items={kpis}
        loading={loading}
      />

      <Filters
        value={filters}
        onChange={setFilters}
        disabled={loading}
      />

      <MainSplit
        tables={tables}
        reservations={reservations}
        onReservationSelect={handleReservationSelect}
        onTableFocus={handleTableFocus}
        focusTableId={focusTableId}
        loading={loading}
        error={error}
      />

      <ReservationDrawer
        open={drawerOpen}
        reservation={selectedReservation}
        policy={policies}
        onOpenChange={setDrawerOpen}
        onEdit={() => {
          // TODO: Implement edit functionality
          console.log('Edit reservation:', selectedReservation?.id);
        }}
        onMove={() => {
          // TODO: Implement move functionality
          console.log('Move reservation:', selectedReservation?.id);
        }}
        onMessage={() => {
          // TODO: Implement message functionality
          console.log('Message guest:', selectedReservation?.guestName);
        }}
        onCancel={async () => {
          // TODO: Implement cancel functionality
          console.log('Cancel reservation:', selectedReservation?.id);
          setDrawerOpen(false);
        }}
      />
    </main>
  );
}