import { CalendarIcon, Search, Plus, Download, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TopBarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  loading?: boolean;
}

export function TopBar({ selectedDate, onDateChange, loading }: TopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isCommandCenter = location.pathname === '/command-center';

  const handleModeToggle = () => {
    const newMode = isCommandCenter ? 'advanced' : 'focus';
    localStorage.setItem('ui.mode', newMode);
    
    if (isCommandCenter) {
      navigate('/dashboard');
    } else {
      navigate('/command-center');
    }
  };

  return (
    <div className="glass rounded-[10px] p-3 flex items-center justify-between gap-3">
      {/* Brand */}
      <div className="text-muted-foreground font-medium">
        Blunari — Bookings Command Center
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Venue Switcher */}
        <Select defaultValue="demo-restaurant">
          <SelectTrigger className="w-[180px] glass border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="demo-restaurant">Demo Restaurant</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search Guests"
            className="w-[200px] pl-10 glass border-white/10"
          />
        </div>

        {/* Context */}
        <Select defaultValue="all">
          <SelectTrigger className="w-[100px] glass border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] justify-start text-left font-normal glass border-white/10",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "MMM d") : "Today"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* New Reservation */}
        <Button 
          className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-2))] hover:opacity-90 text-white border-0"
          disabled={loading}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Reservation
        </Button>

        {/* Export */}
        <Button variant="outline" className="glass border-white/10">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>

        {/* Live Status */}
        <Badge 
          variant="outline" 
          className="bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.3)] text-[hsl(var(--success))] font-medium"
        >
          <div className="w-2 h-2 bg-[hsl(var(--success))] rounded-full mr-2" />
          LIVE
        </Badge>

        {/* Advanced Mode Toggle */}
        <Button 
          variant="outline" 
          className="glass border-white/10"
          onClick={handleModeToggle}
        >
          {isCommandCenter ? 'Advanced Mode' : 'Focus Mode'}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[hsl(var(--accent))] rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-medium">2</span>
          </div>
        </Button>
      </div>
    </div>
  );
}