import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import type { FiltersState } from './types';

interface FiltersProps {
  value: FiltersState;
  onChange: (value: FiltersState) => void;
  disabled?: boolean;
}

export function Filters({ value, onChange, disabled }: FiltersProps) {
  const hasActiveFilters = Object.values(value).some(v => 
    Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined
  );

  const clearAll = () => {
    onChange({});
  };

  return (
    <div className="flex items-center gap-2" role="toolbar" aria-label="Booking filters">
      {/* Party Size */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`glass border-white/10 ${
              value.party?.length 
                ? 'bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))]' 
                : ''
            }`}
            disabled={disabled}
          >
            Party Size
            {value.party?.length && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {value.party.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <ToggleGroup
            type="multiple"
            value={value.party?.map(String) || []}
            onValueChange={(newValue) => 
              onChange({ ...value, party: newValue.map(Number) })
            }
            className="grid grid-cols-2 gap-1"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
              <ToggleGroupItem
                key={size}
                value={String(size)}
                className="h-8 text-sm"
              >
                {size}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PopoverContent>
      </Popover>

      {/* Channel */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`glass border-white/10 ${
              value.channel?.length 
                ? 'bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))]' 
                : ''
            }`}
            disabled={disabled}
          >
            Channel
            {value.channel?.length && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {value.channel.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-2">
          <ToggleGroup
            type="multiple"
            value={value.channel || []}
            onValueChange={(newValue) => 
              onChange({ ...value, channel: newValue as FiltersState['channel'] })
            }
            className="flex flex-col gap-1"
          >
            <ToggleGroupItem value="WEB" className="justify-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Web
            </ToggleGroupItem>
            <ToggleGroupItem value="PHONE" className="justify-start">
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
              Phone
            </ToggleGroupItem>
            <ToggleGroupItem value="WALKIN" className="justify-start">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
              Walk-in
            </ToggleGroupItem>
          </ToggleGroup>
        </PopoverContent>
      </Popover>

      {/* Status */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`glass border-white/10 ${
              value.status?.length 
                ? 'bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))]' 
                : ''
            }`}
            disabled={disabled}
          >
            Status
            {value.status?.length && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {value.status.length}
              </Badge>
            )}
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <ToggleGroup
            type="multiple"
            value={value.status || []}
            onValueChange={(newValue) => 
              onChange({ ...value, status: newValue })
            }
            className="flex flex-col gap-1"
          >
            <ToggleGroupItem value="confirmed" className="justify-start">
              Confirmed
            </ToggleGroupItem>
            <ToggleGroupItem value="seated" className="justify-start">
              Seated
            </ToggleGroupItem>
            <ToggleGroupItem value="completed" className="justify-start">
              Completed
            </ToggleGroupItem>
            <ToggleGroupItem value="cancelled" className="justify-start">
              Cancelled
            </ToggleGroupItem>
          </ToggleGroup>
        </PopoverContent>
      </Popover>

      {/* Deposits */}
      <Button
        variant="outline"
        className={`glass border-white/10 ${
          value.deposits 
            ? 'bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))]' 
            : ''
        }`}
        disabled={disabled}
        onClick={() => {
          const newValue = value.deposits === 'ON' ? null : 'ON';
          onChange({ ...value, deposits: newValue });
        }}
      >
        Deposits
        {value.deposits && (
          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
            {value.deposits}
          </Badge>
        )}
      </Button>

      {/* VIP */}
      <Button
        variant="outline"
        className={`glass border-white/10 ${
          value.vip 
            ? 'bg-[hsl(var(--accent)/0.1)] border-[hsl(var(--accent)/0.3)] text-[hsl(var(--accent))]' 
            : ''
        }`}
        disabled={disabled}
        onClick={() => {
          onChange({ ...value, vip: value.vip ? null : true });
        }}
      >
        VIP
        {value.vip && (
          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
            ON
          </Badge>
        )}
      </Button>

      {/* Clear All */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
          onClick={clearAll}
          disabled={disabled}
        >
          Clear all
        </Button>
      )}
    </div>
  );
}