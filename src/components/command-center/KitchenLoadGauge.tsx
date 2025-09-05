interface KitchenLoadGaugeProps {
  value: number; // 0-100
}

export function KitchenLoadGauge({ value }: KitchenLoadGaugeProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const angle = (clampedValue / 100) * 180; // Half circle
  const radius = 40;
  const strokeWidth = 6;
  
  // Calculate the arc path
  const startAngle = 180; // Start from left (180 degrees)
  const endAngle = startAngle - angle; // Sweep counter-clockwise
  
  const startX = radius + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = radius + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = radius + radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = radius + radius * Math.sin((endAngle * Math.PI) / 180);
  
  const largeArcFlag = angle > 180 ? 1 : 0;
  
  const pathData = `
    M ${startX} ${startY}
    A ${radius} ${radius} 0 ${largeArcFlag} 0 ${endX} ${endY}
  `;

  return (
    <div className="glass rounded-[10px] p-4">
      <div className="text-center">
        <div className="relative inline-block">
          <svg width="100" height="60" viewBox="0 0 100 60">
            {/* Background arc */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Progress arc */}
            <path
              d={pathData}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          
          {/* Value display */}
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <span className="text-sm font-medium tabular-nums">
              {clampedValue}%
            </span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Kitchen Load
        </div>
      </div>
    </div>
  );
}