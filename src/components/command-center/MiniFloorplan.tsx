import { Button } from '@/components/ui/button';
import type { TableRow } from './types';

interface MiniFloorplanProps {
  tables: TableRow[];
  onTableFocus: (tableId: string) => void;
  focusTableId?: string;
}

export function MiniFloorplan({ tables, onTableFocus, focusTableId }: MiniFloorplanProps) {
  // Create a simplified 2D layout based on the reference image
  const tableLayout = [
    { id: '1', x: 20, y: 40, size: 'small', type: 'circle' },
    { id: '2', x: 60, y: 40, size: 'small', type: 'circle' },
    { id: '3', x: 100, y: 40, size: 'small', type: 'circle' },
    { id: '4', x: 140, y: 40, size: 'small', type: 'circle' },
    { id: '5', x: 180, y: 40, size: 'small', type: 'circle' },
    { id: '6', x: 220, y: 40, size: 'small', type: 'circle' },
    
    { id: '7', x: 20, y: 80, size: 'large', type: 'circle' },
    { id: '8', x: 70, y: 80, size: 'large', type: 'circle' },
    { id: '9', x: 120, y: 80, size: 'large', type: 'circle' },
    { id: '10', x: 170, y: 80, size: 'large', type: 'circle' },
    { id: '11', x: 220, y: 80, size: 'large', type: 'circle' },
    
    // Booth section (rectangles)
    { id: '12', x: 40, y: 130, size: 'booth', type: 'rect' },
    { id: '13', x: 100, y: 130, size: 'booth', type: 'rect' },
    { id: '14', x: 160, y: 130, size: 'booth', type: 'rect' },
  ];

  const getTableStatus = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return 'available';
    return table.available ? 'available' : 'occupied';
  };

  const getStatusColor = (status: string, isFocused: boolean) => {
    if (isFocused) return 'stroke-[hsl(var(--accent))] fill-[hsl(var(--accent)/0.2)]';
    
    switch (status) {
      case 'available':
        return 'stroke-blue-400 fill-blue-400/20';
      case 'occupied':
        return 'stroke-purple-400 fill-purple-400/20';
      default:
        return 'stroke-gray-400 fill-gray-400/20';
    }
  };

  return (
    <div className="glass rounded-[10px] p-4">
      <div className="relative">
        <svg
          width="260"
          height="180"
          viewBox="0 0 260 180"
          className="w-full h-auto cursor-pointer"
        >
          {/* Background sections */}
          <rect
            x="0"
            y="0"
            width="260"
            height="60"
            fill="hsl(var(--muted)/0.1)"
            stroke="hsl(var(--muted)/0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
            rx="4"
          />
          <text x="130" y="15" textAnchor="middle" className="fill-muted-foreground text-xs">
            Patio
          </text>
          
          <rect
            x="0"
            y="110"
            width="260"
            height="70"
            fill="hsl(var(--muted)/0.1)"
            stroke="hsl(var(--muted)/0.3)"
            strokeWidth="1"
            strokeDasharray="2,2"
            rx="4"
          />
          <text x="130" y="125" textAnchor="middle" className="fill-muted-foreground text-xs">
            Main Dining
          </text>

          {/* Tables */}
          {tableLayout.map((table) => {
            const status = getTableStatus(table.id);
            const isFocused = focusTableId === table.id;
            const colorClass = getStatusColor(status, isFocused);
            
            return (
              <g
                key={table.id}
                onClick={() => onTableFocus(table.id)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                {table.type === 'circle' ? (
                  <circle
                    cx={table.x}
                    cy={table.y}
                    r={table.size === 'small' ? 8 : 12}
                    className={colorClass}
                    strokeWidth="2"
                  />
                ) : (
                  <rect
                    x={table.x - 15}
                    y={table.y - 8}
                    width="30"
                    height="16"
                    rx="4"
                    className={colorClass}
                    strokeWidth="2"
                  />
                )}
                <text
                  x={table.x}
                  y={table.y + 2}
                  textAnchor="middle"
                  className="fill-foreground text-[10px] font-medium pointer-events-none"
                >
                  {table.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}