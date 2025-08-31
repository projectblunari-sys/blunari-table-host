import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { useTenantBranding } from '@/contexts/TenantBrandingContext';
import { 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Wifi,
  WifiOff,
  Calendar,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardHeader: React.FC = () => {
  const { tenant } = useTenant();
  const { user, signOut } = useAuth();
  const { isConnected } = useRealtimeBookings(tenant?.id);
  const { restaurantName } = useTenantBranding();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-gradient-to-r from-background via-card to-background border-b border-border/50 px-4 py-6 md:px-6 backdrop-blur-sm">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        {/* Restaurant Info & Date */}
        <div className="space-y-2">
          <h1 className="text-h2 font-bold bg-gradient-primary bg-clip-text text-transparent">
            {restaurantName}
          </h1>
          <p className="text-body-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {currentDate}
          </p>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-warm rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative px-4 py-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-body-sm">
                  <div className="font-semibold text-foreground font-tabular">87%</div>
                  <div className="text-xs text-muted-foreground">Capacity</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-primary rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative px-4 py-3 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isConnected ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-success animate-pulse-soft' : 'bg-destructive'}`}></div>
                </div>
                <div className="text-body-sm">
                  <div className="font-semibold text-foreground">
                    {isConnected ? 'Live' : 'Offline'}
                  </div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex items-center gap-3">
          {/* Enhanced Real-time connection status */}
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className={`flex items-center gap-2 px-3 py-1 transition-all duration-300 ${
              isConnected ? 'bg-success/10 text-success border-success/20 hover:bg-success/20' : ''
            }`}
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Offline
              </>
            )}
          </Badge>

          <Button 
            variant="outline" 
            size="sm" 
            className="relative group hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
          >
            <Bell className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
            <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-destructive animate-pulse-soft"></Badge>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            className="group hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
          >
            <Settings className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
          </Button>

          {/* Enhanced User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="group hover:bg-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <User className="h-4 w-4 group-hover:text-primary transition-colors duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.first_name || 'User'} {user?.user_metadata?.last_name || ''}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;