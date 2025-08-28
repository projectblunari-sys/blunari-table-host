import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTenant } from '@/hooks/useTenant';
import { useTodaysBookings } from '@/hooks/useRealtimeBookings';
import TodaysBookings from '@/components/dashboard/TodaysBookings';
import QuickActions from '@/components/dashboard/QuickActions';
import TableStatus from '@/components/dashboard/TableStatus';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const DashboardHome: React.FC = () => {
  const { tenant } = useTenant();
  const { bookings, isLoading } = useTodaysBookings(tenant?.id);

  // Calculate today's metrics
  const todayMetrics = React.useMemo(() => {
    if (!bookings) return { total: 0, confirmed: 0, seated: 0, completed: 0, revenue: 0 };
    
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      seated: bookings.filter(b => b.status === 'seated').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      revenue: bookings.filter(b => b.status === 'completed').length * 85, // Estimated average
    };
  }, [bookings]);

  const metrics = [
    {
      title: "Today's Revenue",
      value: `$${todayMetrics.revenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+12%",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Total Bookings",
      value: todayMetrics.total.toString(),
      icon: Calendar,
      trend: "+5",
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Seated Guests",
      value: todayMetrics.seated.toString(),
      icon: Users,
      trend: `${todayMetrics.seated}/${todayMetrics.total}`,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      title: "Average Wait",
      value: "12 min",
      icon: Clock,
      trend: "-3 min",
      color: "text-accent",
      bgColor: "bg-accent/10"
    }
  ];

  const alerts = [
    {
      type: 'warning',
      message: 'Table 5 has been occupied for 2+ hours',
      time: '10 minutes ago',
      icon: AlertCircle
    },
    {
      type: 'success',
      message: 'Kitchen prep completed for 7:30 PM reservations',
      time: '15 minutes ago',
      icon: CheckCircle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening at {tenant?.name || 'your restaurant'} today.
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((metric, index) => (
          <Card key={metric.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={metric.color}>{metric.trend}</span> from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <alert.icon className={`h-5 w-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-warning' : 'text-success'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Dismiss
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Bookings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <TodaysBookings />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <QuickActions />
        </motion.div>
      </div>

      {/* Table Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <TableStatus />
      </motion.div>
    </div>
  );
};

export default DashboardHome;