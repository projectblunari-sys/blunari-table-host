import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReservationCard } from './ReservationCard';
import type { TableRow, Reservation, Section } from './types';

interface TimelineProps {
  tables: TableRow[];
  reservations: Reservation[];
  onReservationSelect: (reservation: Reservation) => void;
  focusTableId?: string;
}

export function Timeline({ 
  tables, 
  reservations, 
  onReservationSelect, 
  focusTableId 
}: TimelineProps) {
  const [selectedSection, setSelectedSection] = useState<Section | 'All'>('All');

  // Time slots from 5:00 PM to 10:00 PM in 15-minute intervals
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 17; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 22 && minute > 0) break; // Stop at 10:00 PM
        const time = `${hour}:${minute.toString().padStart(2, '0')}`;
        const displayTime = hour > 12 
          ? `${hour - 12}:${minute.toString().padStart(2, '0')} PM`
          : hour === 12
          ? `12:${minute.toString().padStart(2, '0')} PM`
          : `${hour}:${minute.toString().padStart(2, '0')} AM`;
        slots.push({ time, displayTime });
      }
    }
    return slots;
  }, []);

  // Group tables by section
  const sections = useMemo(() => {
    const grouped = tables.reduce((acc, table) => {
      if (!acc[table.section]) {
        acc[table.section] = [];
      }
      acc[table.section].push(table);
      return acc;
    }, {} as Record<Section, TableRow[]>);

    // Sort tables within each section
    Object.keys(grouped).forEach(section => {
      grouped[section as Section].sort((a, b) => {
        const aNum = parseInt(a.name.replace(/\D/g, ''), 10);
        const bNum = parseInt(b.name.replace(/\D/g, ''), 10);
        return aNum - bNum;
      });
    });

    return grouped;
  }, [tables]);

  const filteredSections = selectedSection === 'All' 
    ? sections 
    : { [selectedSection]: sections[selectedSection] || [] };

  // Get reservations for a specific table
  const getTableReservations = (tableId: string) => {
    return reservations.filter(r => r.tableId === tableId);
  };

  // Calculate position and width for reservation cards
  const getReservationPosition = (reservation: Reservation) => {
    const startTime = new Date(`2024-01-01T${reservation.start.split('T')[1]}`);
    const endTime = new Date(`2024-01-01T${reservation.end.split('T')[1]}`);
    
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    
    // Calculate position as percentage of the timeline
    const startPosition = ((startHour - 17) * 60 + startMinute) / (5 * 60) * 100;
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    const width = (duration / (5 * 60)) * 100;
    
    return { left: `${Math.max(0, startPosition)}%`, width: `${Math.min(width, 100 - startPosition)}%` };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex gap-2">
          {['All', 'Patio', 'Bar', 'Main'].map((section) => (
            <Button
              key={section}
              variant={selectedSection === section ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedSection(section as Section | 'All')}
              className={selectedSection === section 
                ? 'bg-[hsl(var(--accent))] text-white' 
                : 'text-muted-foreground hover:text-foreground'
              }
            >
              {section}
            </Button>
          ))}
        </div>
      </div>

      {/* Time Header */}
      <div className="flex border-b border-white/10">
        <div className="w-24 p-2 border-r border-white/10 text-xs font-medium text-muted-foreground">
          Table
        </div>
        <div className="flex-1 flex">
          {timeSlots.map((slot, index) => (
            <div
              key={slot.time}
              className={`flex-1 p-2 text-xs text-center border-r border-white/10 ${
                index % 4 === 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`}
            >
              {index % 4 === 0 ? slot.displayTime.split(' ')[0] : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {Object.entries(filteredSections).map(([sectionName, sectionTables]) => (
          <div key={sectionName}>
            {/* Section Header */}
            <div className="sticky top-0 bg-[hsl(var(--card))] border-b border-white/10 p-2">
              <h3 className="text-sm font-semibold text-foreground">{sectionName}</h3>
            </div>

            {/* Tables in Section */}
            {sectionTables.map((table) => {
              const tableReservations = getTableReservations(table.id);
              const isFocused = focusTableId === table.id;
              
              return (
                <div
                  key={table.id}
                  className={`flex border-b border-white/10 h-12 ${
                    isFocused ? 'bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)]' : ''
                  }`}
                >
                  {/* Table Name */}
                  <div className="w-24 p-2 border-r border-white/10 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {table.name}
                    </span>
                    {tableReservations.length > 0 && (
                      <Badge variant="secondary" className="h-4 px-1 text-xs">
                        {tableReservations.length}
                      </Badge>
                    )}
                  </div>

                  {/* Timeline Row */}
                  <div className="flex-1 relative">
                    {/* Time Grid */}
                    <div className="absolute inset-0 flex">
                      {timeSlots.map((_, index) => (
                        <div
                          key={index}
                          className="flex-1 border-r border-white/5"
                        />
                      ))}
                    </div>

                    {/* Reservations */}
                    {tableReservations.map((reservation) => {
                      const position = getReservationPosition(reservation);
                      return (
                        <div
                          key={reservation.id}
                          className="absolute top-1 bottom-1"
                          style={position}
                        >
                          <ReservationCard
                            reservation={reservation}
                            onClick={() => onReservationSelect(reservation)}
                          />
                        </div>
                      );
                    })}

                    {/* Utilization Bar */}
                    <div className="absolute bottom-0 right-2 w-20 h-1">
                      <div className="flex h-full gap-px">
                        <div className="flex-1 bg-amber-400 rounded-sm" />
                        <div className="flex-1 bg-gray-400 rounded-sm" />
                        <div className="flex-1 bg-amber-400 rounded-sm" />
                        <div className="flex-1 bg-gray-400 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Empty State */}
        {Object.keys(filteredSections).length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No tables in selected section
          </div>
        )}
      </div>
    </div>
  );
}