import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  UserX, 
  Activity,
  BarChart3,
  PieChart,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line, LineChart, Pie } from 'recharts';

interface Booking {
  id: string;
  status: string;
  booking_time: string;
  party_size: number;
  guest_name: string;
  created_at: string;
}

interface AdvancedBookingStatusOverviewProps {
  bookings: Booking[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  isLoading?: boolean;
}

const AdvancedBookingStatusOverview: React.FC<AdvancedBookingStatusOverviewProps> = ({
  bookings,
  selectedStatus,
  onStatusChange,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'analytics' | 'trends'>('overview');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Status configuration with colors and icons
  const statusConfig = {
    all: { 
      label: 'All Bookings', 
      color: 'hsl(var(--muted))', 
      icon: Activity, 
      gradient: 'from-slate-500 to-slate-600' 
    },
    pending: { 
      label: 'Pending', 
      color: 'hsl(var(--warning))', 
      icon: Clock, 
      gradient: 'from-yellow-500 to-orange-500' 
    },
    confirmed: { 
      label: 'Confirmed', 
      color: 'hsl(var(--success))', 
      icon: CheckCircle2, 
      gradient: 'from-green-500 to-emerald-500' 
    },
    seated: { 
      label: 'Seated', 
      color: 'hsl(var(--primary))', 
      icon: Users, 
      gradient: 'from-blue-500 to-cyan-500' 
    },
    completed: { 
      label: 'Completed', 
      color: 'hsl(var(--success))', 
      icon: CheckCircle2, 
      gradient: 'from-emerald-600 to-green-600' 
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'hsl(var(--destructive))', 
      icon: XCircle, 
      gradient: 'from-red-500 to-rose-500' 
    },
    noshow: { 
      label: 'No Show', 
      color: 'hsl(var(--destructive))', 
      icon: UserX, 
      gradient: 'from-red-600 to-red-700' 
    }
  };

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const getDateFilter = () => {
      switch (timeRange) {
        case 'today': return (date: Date) => date >= startOfDay;
        case 'week': return (date: Date) => date >= startOfWeek;
        case 'month': return (date: Date) => date >= startOfMonth;
        default: return () => true;
      }
    };

    const filteredBookings = bookings.filter(b => 
      getDateFilter()(new Date(b.booking_time))
    );

    const statusCounts = Object.keys(statusConfig).reduce((acc, status) => {
      acc[status] = status === 'all' 
        ? filteredBookings.length 
        : filteredBookings.filter(b => b.status === status).length;
      return acc;
    }, {} as Record<string, number>);

    const totalGuests = filteredBookings.reduce((sum, b) => sum + b.party_size, 0);
    const avgPartySize = filteredBookings.length > 0 ? totalGuests / filteredBookings.length : 0;

    // Conversion rates
    const confirmationRate = statusCounts.all > 0 
      ? ((statusCounts.confirmed + statusCounts.seated + statusCounts.completed) / statusCounts.all) * 100 
      : 0;
    
    const completionRate = statusCounts.confirmed > 0 
      ? (statusCounts.completed / (statusCounts.confirmed + statusCounts.seated + statusCounts.completed)) * 100 
      : 0;

    const noshowRate = statusCounts.all > 0 
      ? (statusCounts.noshow / statusCounts.all) * 100 
      : 0;

    // Trend calculations (compare with previous period)
    const previousPeriod = new Date(startOfDay);
    if (timeRange === 'today') previousPeriod.setDate(previousPeriod.getDate() - 1);
    else if (timeRange === 'week') previousPeriod.setDate(previousPeriod.getDate() - 7);
    else if (timeRange === 'month') previousPeriod.setMonth(previousPeriod.getMonth() - 1);

    const previousBookings = bookings.filter(b => {
      const bookingDate = new Date(b.booking_time);
      return bookingDate >= previousPeriod && bookingDate < (timeRange === 'today' ? startOfDay : 
        timeRange === 'week' ? startOfWeek : startOfMonth);
    });

    const getTrend = (current: number, previous: number) => {
      if (previous === 0) return { direction: 'none' as const, percentage: 0 };
      const change = ((current - previous) / previous) * 100;
      return {
        direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'none' as const,
        percentage: Math.abs(change)
      };
    };

    const trends = {
      total: getTrend(filteredBookings.length, previousBookings.length),
      confirmed: getTrend(statusCounts.confirmed, previousBookings.filter(b => b.status === 'confirmed').length),
      completed: getTrend(statusCounts.completed, previousBookings.filter(b => b.status === 'completed').length)
    };

    return {
      statusCounts,
      totalGuests,
      avgPartySize,
      confirmationRate,
      completionRate,
      noshowRate,
      trends,
      filteredBookings
    };
  }, [bookings, timeRange]);

  // Pie chart data
  const pieData = Object.entries(analytics.statusCounts)
    .filter(([status]) => status !== 'all' && analytics.statusCounts[status] > 0)
    .map(([status, count]) => ({
      name: statusConfig[status as keyof typeof statusConfig].label,
      value: count,
      color: statusConfig[status as keyof typeof statusConfig].color
    }));

  const TrendIndicator: React.FC<{ trend: { direction: 'up' | 'down' | 'none'; percentage: number } }> = ({ trend }) => {
    if (trend.direction === 'none') return <Minus className="h-3 w-3 text-muted-foreground" />;
    
    const Icon = trend.direction === 'up' ? ArrowUp : ArrowDown;
    const colorClass = trend.direction === 'up' ? 'text-success' : 'text-destructive';
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">{trend.percentage.toFixed(1)}%</span>
      </div>
    );
  };

  const StatusCard: React.FC<{ status: string; count: number; isSelected: boolean }> = ({ 
    status, 
    count, 
    isSelected 
  }) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    const percentage = analytics.statusCounts.all > 0 ? (count / analytics.statusCounts.all) * 100 : 0;

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-primary' : ''
        }`}
        onClick={() => onStatusChange(status)}
      >
        <Card className={`h-full bg-gradient-to-br ${config.gradient} text-white shadow-lg hover:shadow-xl transition-shadow`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Icon className="h-5 w-5 opacity-80" />
              {status !== 'all' && (
                <TrendIndicator trend={analytics.trends[status as keyof typeof analytics.trends] || { direction: 'none', percentage: 0 }} />
              )}
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm opacity-90">{config.label}</div>
              {status !== 'all' && (
                <Progress 
                  value={percentage} 
                  className="h-1 bg-white/20" 
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            Advanced Booking Analytics
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
              <TabsList className="grid w-fit grid-cols-3">
                <TabsTrigger value="today" className="text-xs">Today</TabsTrigger>
                <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
                <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('overview')}
                className="h-8 px-3"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('analytics')}
                className="h-8 px-3"
              >
                <PieChart className="h-3 w-3" />
              </Button>
              <Button
                variant={viewMode === 'trends' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('trends')}
                className="h-8 px-3"
              >
                <TrendingUp className="h-3 w-3" />
              </Button>
            </div>

            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Status Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {Object.entries(analytics.statusCounts).map(([status, count]) => (
                  <StatusCard
                    key={status}
                    status={status}
                    count={count}
                    isSelected={selectedStatus === status}
                  />
                ))}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{analytics.totalGuests}</div>
                    <div className="text-sm text-blue-600">Total Guests</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{analytics.confirmationRate.toFixed(1)}%</div>
                    <div className="text-sm text-green-600">Confirmation Rate</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">{analytics.avgPartySize.toFixed(1)}</div>
                    <div className="text-sm text-purple-600">Avg Party Size</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">{analytics.noshowRate.toFixed(1)}%</div>
                    <div className="text-sm text-orange-600">No-Show Rate</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {viewMode === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Status Distribution Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confirmation Rate</span>
                      <span className="font-semibold">{analytics.confirmationRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.confirmationRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">{analytics.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.completionRate} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">No-Show Rate</span>
                      <span className="font-semibold text-destructive">{analytics.noshowRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.noshowRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {viewMode === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Bookings</div>
                        <div className="text-2xl font-bold">{analytics.statusCounts.all}</div>
                      </div>
                      <TrendIndicator trend={analytics.trends.total} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Confirmed</div>
                        <div className="text-2xl font-bold">{analytics.statusCounts.confirmed}</div>
                      </div>
                      <TrendIndicator trend={analytics.trends.confirmed} />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                        <div className="text-2xl font-bold">{analytics.statusCounts.completed}</div>
                      </div>
                      <TrendIndicator trend={analytics.trends.completed} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Detailed timeline analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AdvancedBookingStatusOverview;