import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { CalendarIcon, Download, RefreshCw, TrendingUp, BarChart3, Users, Target } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useTenant } from '@/hooks/useTenant';
import ROIMetricsCard from '@/components/analytics/ROIMetricsCard';
import RevenueChart from '@/components/analytics/RevenueChart';
import BookingPatternsChart from '@/components/analytics/BookingPatternsChart';
import OperationalMetrics from '@/components/analytics/OperationalMetrics';
import PageHeader from '@/components/ui/page-header';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { SkeletonPage, SkeletonChart, SkeletonMetricsCard } from '@/components/ui/skeleton-components';
import { toast } from '@/hooks/use-toast';

const Analytics: React.FC = () => {
  const { tenant } = useTenant();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const { data: analyticsData, isLoading, refetch } = useAnalytics(
    tenant?.id,
    dateRange ? {
      start: dateRange.from?.toISOString() || '',
      end: dateRange.to?.toISOString() || '',
    } : undefined
  );

  const handleExport = async () => {
    try {
      // In a real implementation, this would generate and download a report
      const reportData = {
        period: dateRange ? `${format(dateRange.from!, 'MMM dd, yyyy')} - ${format(dateRange.to!, 'MMM dd, yyyy')}` : 'Last 30 days',
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
      
      toast({
        title: "Report Exported",
        description: "Analytics report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated.",
    });
  };

  // Add error state for failed data fetch
  const [error, setError] = useState<string | null>(null);

  const handleSetupAnalytics = () => {
    console.log('Setting up analytics...');
  };

  // Loading state
  if (isLoading) {
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
        <SkeletonPage />
      </motion.div>
    );
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
      <PageHeader
        title="Analytics & ROI"
        description="Comprehensive business intelligence dashboard"
        primaryAction={{
          label: 'Export Report',
          onClick: handleExport,
          icon: Download
        }}
        secondaryActions={[
          {
            label: 'Refresh',
            onClick: handleRefresh,
            icon: RefreshCw,
            variant: 'outline'
          }
        ]}
        tabs={[
          { value: 'overview', label: 'Overview' },
          { value: 'revenue', label: 'Revenue' },
          { value: 'customers', label: 'Customers' },
          { value: 'operational', label: 'Operations' }
        ]}
        activeTab="overview"
      />

      {/* ROI Metrics */}
      <ROIMetricsCard metrics={analyticsData.roi} />

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    ${analyticsData.revenue.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
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
          <RevenueChart data={analyticsData.revenue} />
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">Last Updated</div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(analyticsData.lastUpdated), 'MMM dd, yyyy at h:mm a')}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Data Period</div>
              <div className="text-xs text-muted-foreground">
                {dateRange 
                  ? `${format(dateRange.from!, 'MMM dd')} - ${format(dateRange.to!, 'MMM dd, yyyy')}`
                  : 'Last 30 days'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Analytics;