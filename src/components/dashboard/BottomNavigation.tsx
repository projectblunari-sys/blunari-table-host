import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ChefHat, 
  BarChart3, 
  Settings, 
  TableProperties, 
  Clock, 
  MessageSquare,
  Code,
  Plug
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Tables', href: '/dashboard/tables', icon: TableProperties },
  { name: 'Customers', href: '/dashboard/customers', icon: Users },
  { name: 'Widget', href: '/dashboard/widget-preview', icon: Code },
  { name: 'POS', href: '/dashboard/pos-integrations', icon: Plug },
  { name: 'Waitlist', href: '/dashboard/waitlist', icon: Clock },
  { name: 'Staff', href: '/dashboard/staff', icon: ChefHat },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
    >
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navigation.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                relative flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 min-h-[60px]
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="bottomActiveIndicator"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full"
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
      
      {/* Secondary Navigation - Scrollable */}
      <div className="border-t border-border bg-muted/30">
        <div className="flex gap-1 px-2 py-2 overflow-x-auto scrollbar-none">
          {navigation.slice(5).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Safe area for mobile devices */}
      <div className="h-safe-area-bottom bg-card"></div>
    </motion.nav>
  );
};

export default BottomNavigation;