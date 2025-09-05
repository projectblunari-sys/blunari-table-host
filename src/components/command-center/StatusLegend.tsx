import { Badge } from '@/components/ui/badge';

export function StatusLegend() {
  const statuses = [
    { name: 'Available', color: 'bg-blue-400', count: 12 },
    { name: 'Seated', color: 'bg-purple-400', count: 8 },
    { name: 'Phone', color: 'bg-gray-400', count: 3 },
    { name: 'Walk In Dirty', color: 'bg-amber-400', count: 2 },
    { name: 'Maintenance', color: 'bg-muted', count: 1, icon: '🔧' },
  ];

  return (
    <div className="glass rounded-[10px] p-4">
      <div className="space-y-2">
        {statuses.map((status) => (
          <div
            key={status.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-foreground">{status.name}</span>
              {status.icon && (
                <span className="text-xs">{status.icon}</span>
              )}
            </div>
            <Badge 
              variant="secondary" 
              className="h-5 px-1.5 text-xs tabular-nums bg-muted/50"
            >
              {status.count}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}