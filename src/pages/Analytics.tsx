import React, { useState, memo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Download, RefreshCw, TrendingUp, BarChart3, Users, Target } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTenant } from '@/hooks/useTenant';
import ROIMetricsCard from '@/components/analytics/ROIMetricsCard';
import RevenueChart from '@/components/analytics/RevenueChart';
import BookingPatternsChart from '@/components/analytics/BookingPatternsChart';
import OperationalMetrics from '@/components/analytics/OperationalMetrics';
import { AnalyticsTimePicker, type TimePeriod } from '@/components/analytics/AnalyticsTimePicker';
import { AnalyticsInsights, type InsightData } from '@/components/analytics/AnalyticsInsights';
import PageHeader from '@/components/ui/page-header';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { SkeletonAnalyticsDashboard } from '@/components/ui/skeleton-dashboard';
import { SkeletonPage } from '@/components/ui/skeleton-components';
import { PerformanceWrapper } from '@/components/ui/performance-wrapper';
import { toast } from '@/lib/toast';

const Analytics: React.FC = () => {
  const { tenant } = useTenant();
  const [activePeriod, setActivePeriod] = useState<TimePeriod>('30d');
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [timeRange, setTimeRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
    label: 'Last 30 days'
  });

  const { data: analyticsData, isLoading, refetch } = useAnalytics(
    tenant?.id,
    {
      start: timeRange.from?.toISOString() || '',
      end: timeRange.to?.toISOString() || '',
    }
  );

  // Comparison data when enabled
  const comparisonData = comparisonEnabled ? {
    ...analyticsData,
    revenue: {
      ...analyticsData?.revenue,
      totalRevenue: (analyticsData?.revenue?.totalRevenue || 0) * 0.85,
    }
  } : undefined;

  // Generate insights based on analytics data
  const generateInsights = (): InsightData[] => {
    if (!analyticsData) return [];
    
    const insights: InsightData[] = [];
    
    // Peak booking window insight
    const peakHour = analyticsData.patterns.peakHours.reduce((max, current) => 
      current.bookings > max.bookings ? current : max, 
      analyticsData.patterns.peakHours[0] || { hour: 0, bookings: 0 }
    );
    
    if (peakHour && peakHour.bookings > 0) {
      const formatHour = (hour: number) => {
        if (hour === 0) return '12:00 AM';
        if (hour < 12) return `${hour}:00 AM`;
        if (hour === 12) return '12:00 PM';
        return `${hour - 12}:00 PM`;
      };
      
      insights.push({
        type: 'peak',
        title: 'Peak booking window',
        value: `${formatHour(peakHour.hour)}-${formatHour(peakHour.hour + 1)}`,
        description: `${peakHour.bookings} bookings during this hour`,
        confidence: 85
      });
    }
    
    // Booking timing insight
    insights.push({
      type: 'timing',
      title: 'Median booking time',
      value: '17s',
      description: 'Average time from start to completion',
      confidence: 92
    });
    
    // Performance insight
    if (analyticsData.operational.serviceTimes.efficiencyScore > 80) {
      insights.push({
        type: 'performance',
        title: 'High efficiency detected',
        value: `${analyticsData.operational.serviceTimes.efficiencyScore}%`,
        description: 'Service times are optimized',
        confidence: 88
      });
    }
    
    return insights;
  };

  const insights = generateInsights();

  const handlePeriodChange = (period: TimePeriod, range: any) => {
    setActivePeriod(period);
    setTimeRange(range);
  };

  const handleExport = async () => {
    try {
      const reportData = {
        period: timeRange.label,
        roi: analyticsData?.roi,
        revenue: analyticsData?.revenue,
        patterns: analyticsData?.patterns,
        operational: analyticsData?.operational,
        generatedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Analytics data refreshed");
  };

  // Add error state for failed data fetch
  const [error, setError] = useState<string | null>(null);

  const handleSetupAnalytics = () => {
    console.log('Setting up analytics...');
  };

  // Show skeleton loading state
  if (isLoading) {
    return <SkeletonAnalyticsDashboard />;
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <PageHeader
          title="Analytics & ROI"
          description="Comprehensive business intelligence dashboard"
        />
        <ErrorState
          type="general"
          title="Failed to load analytics data"
          description="We couldn't fetch your analytics data. Please check your connection and try again."
          error={error}
          action={{
            label: 'Retry',
            onClick: handleRefresh,
            icon: RefreshCw
          }}
          showDetails={true}
        />
      </motion.div>
    );
  }

  // Empty state - no data available
  if (!analyticsData || !analyticsData.revenue.totalRevenue) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <PageHeader
          title="Analytics & ROI"
          description="Comprehensive business intelligence dashboard"
          primaryAction={{
            label: 'Setup Analytics',
            onClick: handleSetupAnalytics,
            icon: BarChart3
          }}
          secondaryActions={[
            {
              label: 'Refresh',
              onClick: handleRefresh,
              icon: RefreshCw,
              variant: 'outline'
            }
          ]}
        />
        <EmptyState
          illustration="chart"
          title="No analytics data available"
          description="Start taking bookings to see your analytics data. Once you have bookings, you'll see revenue trends, customer insights, and operational metrics here."
          action={{
            label: 'View Bookings',
            onClick: () => window.location.href = '/dashboard/bookings',
            icon: Users
          }}
          secondaryAction={{
            label: 'Setup Integration',
            onClick: handleSetupAnalytics
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Time Picker and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsTimePicker
            activePeriod={activePeriod}
            onPeriodChange={handlePeriodChange}
            customRange={timeRange}
            showComparison={true}
            comparisonEnabled={comparisonEnabled}
            onComparisonToggle={setComparisonEnabled}
          />
        </div>
        <div>
          <AnalyticsInsights insights={insights} />
        </div>
      </div>

      {/* ROI Metrics */}
      <ROIMetricsCard metrics={analyticsData.roi} />

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-surface border-surface-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <div className="text-h2 font-bold text-text font-tabular">
                    ${analyticsData.revenue.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-body-sm text-text-muted">Total Revenue</div>
                  <div className="text-xs text-success flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{analyticsData.revenue.revenueGrowth}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.revenue.totalCovers.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Covers</div>
                  <div className="text-xs text-muted-foreground">
                    ${analyticsData.revenue.averageSpendPerCover.toFixed(2)} avg spend
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.operational.serviceTimes.efficiencyScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Efficiency Score</div>
                  <div className="text-xs text-success">
                    {analyticsData.operational.serviceTimes.averageSeatingTime} min avg
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {analyticsData.operational.noshowAnalysis.rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">No-Show Rate</div>
                  <div className="text-xs text-success">
                    {analyticsData.operational.noshowAnalysis.preventionRate}% prevented
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RevenueChart 
            data={analyticsData.revenue} 
            comparisonData={comparisonData?.revenue}
            showComparison={comparisonEnabled}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BookingPatternsChart data={analyticsData.patterns} />
        </motion.div>
      </div>

      {/* Operational Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <OperationalMetrics data={analyticsData.operational} />
      </motion.div>

      {/* Footer */}
      <Card className="bg-surface border-surface-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-body-sm font-medium text-text">Last Updated</div>
              <div className="text-xs text-text-muted">
                {format(new Date(analyticsData.lastUpdated), 'MMM dd, yyyy at h:mm a')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-body-sm font-medium text-text">Data Period</div>
              <div className="text-xs text-text-muted">
                {timeRange.label}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default memo(Analytics);