import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SkeletonBox, SkeletonText, SkeletonMetricsCard, SkeletonChart, SkeletonTable, SkeletonPage } from './skeleton-components';

// Dashboard-specific skeleton layouts
export const SkeletonDashboardHeader: React.FC = () => (
  <div className="flex items-start justify-between mb-8">
    <div className="space-y-2">
      <SkeletonBox className="w-64 h-8" />
      <SkeletonBox className="w-96 h-4" />
    </div>
    <div className="flex gap-3">
      <SkeletonBox className="w-32 h-10 rounded-md" />
      <SkeletonBox className="w-10 h-10 rounded-md" />
    </div>
  </div>
);

export const SkeletonDashboardMetrics: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {Array.from({ length: 4 }, (_, i) => (
      <SkeletonMetricsCard key={i} />
    ))}
  </div>
);

export const SkeletonAnalyticsDashboard: React.FC = () => (
  <div className="space-y-6">
    <SkeletonDashboardHeader />
    
    {/* Time picker skeleton */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <SkeletonBox className="w-32 h-9 rounded-md" />
          <SkeletonBox className="w-48 h-9 rounded-md" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="w-20 h-9 rounded-md" />
          <SkeletonBox className="w-24 h-9 rounded-md" />
        </div>
      </CardHeader>
    </Card>
    
    <SkeletonDashboardMetrics />
    
    {/* Charts grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SkeletonChart height="h-80" showLegend />
      <SkeletonChart height="h-80" showLegend />
    </div>
    
    {/* Bottom insights */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <SkeletonTable rows={8} columns={5} />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <SkeletonBox className="w-32 h-5" />
            </CardHeader>
            <CardContent className="space-y-3">
              <SkeletonBox className="w-full h-16 rounded-lg" />
              <SkeletonText lines={2} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonTablesDashboard: React.FC = () => (
  <div className="space-y-6">
    <SkeletonDashboardHeader />
    
    {/* View mode toggle */}
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonBox key={i} className="w-20 h-9 rounded-md" />
        ))}
      </div>
      <SkeletonBox className="w-32 h-9 rounded-md" />
    </div>
    
    {/* Main floor plan area */}
    <Card>
      <CardContent className="p-6">
        <SkeletonBox className="w-full h-96 rounded-lg" />
      </CardContent>
    </Card>
    
    {/* Table stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <SkeletonMetricsCard />
      <SkeletonMetricsCard />
      <SkeletonMetricsCard />
    </div>
  </div>
);

export const SkeletonBookingsDashboard: React.FC = () => (
  <div className="space-y-6">
    <SkeletonDashboardHeader />
    
    {/* Filters */}
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <SkeletonBox className="w-32 h-6" />
          <div className="flex gap-2">
            <SkeletonBox className="w-24 h-9 rounded-md" />
            <SkeletonBox className="w-32 h-9 rounded-md" />
            <SkeletonBox className="w-28 h-9 rounded-md" />
          </div>
        </div>
      </CardHeader>
    </Card>
    
    <SkeletonDashboardMetrics />
    
    {/* Bookings table */}
    <SkeletonTable rows={10} columns={6} />
  </div>
);

export const SkeletonMessagesDashboard: React.FC = () => (
  <div className="h-[calc(100vh-12rem)] flex gap-6">
    {/* Inbox list */}
    <Card className="w-80 flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <SkeletonBox className="w-20 h-6" />
          <SkeletonBox className="w-8 h-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <SkeletonBox className="w-24 h-4" />
                <SkeletonBox className="w-12 h-3" />
              </div>
              <SkeletonBox className="w-full h-3" />
              <SkeletonBox className="w-3/4 h-3" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    
    {/* Conversation pane */}
    <Card className="flex-1 flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <SkeletonBox className="w-10 h-10 rounded-full" />
          <div className="space-y-1">
            <SkeletonBox className="w-32 h-5" />
            <SkeletonBox className="w-24 h-3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <SkeletonBox className={`max-w-xs h-16 rounded-lg ${i % 2 === 0 ? '' : 'bg-brand/20'}`} />
            </div>
          ))}
        </div>
      </CardContent>
      <div className="border-t p-4">
        <SkeletonBox className="w-full h-20 rounded-lg" />
      </div>
    </Card>
  </div>
);