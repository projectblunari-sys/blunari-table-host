import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Save, 
  ChevronRight,
  Home,
  Bell,
  Settings2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantBranding } from '@/contexts/TenantBrandingContext';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import { useTenant } from '@/hooks/useTenant';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

// Route mapping for breadcrumbs
const routeMap: Record<string, { title: string; icon?: React.ComponentType }> = {
  '/dashboard': { title: 'Dashboard', icon: Home },
  '/dashboard/bookings': { title: 'Bookings' },
  '/dashboard/tables': { title: 'Tables' },
  '/dashboard/customers': { title: 'Customers' },
  '/dashboard/widget-preview': { title: 'Booking Widget' },
  '/dashboard/pos-integrations': { title: 'POS Integrations' },
  '/dashboard/waitlist': { title: 'Waitlist' },
  '/dashboard/staff': { title: 'Staff' },
  '/dashboard/messages': { title: 'Messages' },
  '/dashboard/analytics': { title: 'Analytics' },
  '/dashboard/settings': { title: 'Settings' },
};

const BreadcrumbHeader: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { restaurantName } = useTenantBranding();
  const { tenant } = useTenant();
  const { isConnected } = useRealtimeBookings(tenant?.id);
  const { actualLayout, isMobile } = useResponsiveLayout();

  const currentRoute = routeMap[location.pathname];
  const isHomePage = location.pathname === '/dashboard';

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleQuickSave = () => {
    // Implement quick save functionality
    console.log('Quick save triggered');
  };

  return (
    <div className={`sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border/50 ${
      actualLayout === 'sidebar' ? 'px-6 py-4' : 'px-4 py-3'
    }`}>
      <div className={`flex items-center justify-between ${isMobile ? 'gap-2' : 'gap-4'}`}>
        {/* Breadcrumb & Page Title */}
        <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-4'}`}>
          <div className={`flex items-center gap-2 ${isMobile ? 'text-sm' : 'text-body-sm'} text-muted-foreground`}>
            <Home className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            <span className={isMobile ? 'truncate max-w-[120px]' : ''}>{restaurantName}</span>
            {!isHomePage && (
              <>
                <ChevronRight className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                <span className={`text-foreground font-medium ${isMobile ? 'truncate max-w-[100px]' : ''}`}>
                  {currentRoute?.title || 'Page'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-3'}`}>
          {/* Connection Status */}
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className={`text-xs ${
              isConnected ? 'bg-success/10 text-success border-success/20' : ''
            }`}
          >
            {isConnected ? 'Live' : 'Offline'}
          </Badge>

          {/* Quick Actions */}
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-8 px-3 hover:bg-primary/5"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Refresh
              </Button>
            )}
            
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleQuickSave}
                className="h-8 px-3 hover:bg-primary/5"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Quick Save
              </Button>
            )}

            {/* Mobile quick actions */}
            {isMobile && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                className="h-8 w-8 p-0 hover:bg-primary/5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}

            {/* Notification Bell */}
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 relative hover:bg-primary/5"
            >
              <Bell className={isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0 bg-destructive"></Badge>
            </Button>

            {/* Settings */}
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/5"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbHeader;