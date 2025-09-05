import { MiniFloorplan } from './MiniFloorplan';
import { KitchenLoadGauge } from './KitchenLoadGauge';
import { StatusLegend } from './StatusLegend';
import { Timeline } from './Timeline';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import type { TableRow, Reservation } from './types';

interface MainSplitProps {
  tables: TableRow[];
  reservations: Reservation[];
  onReservationSelect: (reservation: Reservation) => void;
  onTableFocus: (tableId: string) => void;
  focusTableId?: string;
  loading?: boolean;
  error?: { code: string; message: string; requestId?: string };
}

export function MainSplit({
  tables,
  reservations,
  onReservationSelect,
  onTableFocus,
  focusTableId,
  loading,
  error
}: MainSplitProps) {
  if (error) {
    return (
      <Alert className="glass border-red-500/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error.message}
          {error.requestId && (
            <span className="text-xs text-muted-foreground ml-2">
              (Ref: {error.requestId})
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 min-h-[600px]">
      {/* Left Panel */}
      <div className="space-y-4">
        {loading ? (
          <>
            <div className="glass rounded-[10px] p-4">
              <Skeleton className="h-[200px] w-full" />
            </div>
            <div className="glass rounded-[10px] p-4">
              <Skeleton className="h-[100px] w-full" />
            </div>
            <div className="glass rounded-[10px] p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </>
        ) : (
          <>
            <MiniFloorplan 
              tables={tables}
              onTableFocus={onTableFocus}
              focusTableId={focusTableId}
            />
            
            <KitchenLoadGauge value={65} />
            
            <StatusLegend />
          </>
        )}
      </div>

      {/* Right Panel - Timeline */}
      <div className="glass rounded-[10px] overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Timeline
            tables={tables}
            reservations={reservations}
            onReservationSelect={onReservationSelect}
            focusTableId={focusTableId}
          />
        )}
      </div>
    </div>
  );
}