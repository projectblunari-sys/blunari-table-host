import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { KpiCard } from './types';

interface KpiStripProps {
  items: KpiCard[];
  loading?: boolean;
}

function SparklineChart({ data, className }: { data: number[]; className?: string }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 40;
    const y = 16 - ((value - min) / range) * 12;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="40" height="16" className={className}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KpiCardComponent({ item }: { item: KpiCard }) {
  const getToneClasses = (tone?: string) => {
    switch (tone) {
      case 'success':
        return 'text-[hsl(var(--success))]';
      case 'warning':
        return 'text-[hsl(var(--warning))]';
      case 'danger':
        return 'text-red-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="glass rounded-[10px] p-4 flex-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            {item.hint && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 text-muted-foreground">
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.hint}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className={`text-2xl font-bold tabular-nums ${getToneClasses(item.tone)}`}>
            {item.value}
          </div>
          {item.sublabel && (
            <div className="text-xs text-[hsl(var(--success))] mt-1">
              {item.sublabel}
            </div>
          )}
        </div>
        
        {item.spark && (
          <div className="ml-2 text-[hsl(var(--accent))]">
            <SparklineChart data={item.spark} />
          </div>
        )}
      </div>
    </div>
  );
}

export function KpiStrip({ items, loading }: KpiStripProps) {
  if (loading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass rounded-[10px] p-4 flex-1">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {items.map((item) => (
        <KpiCardComponent key={item.id} item={item} />
      ))}
    </div>
  );
}