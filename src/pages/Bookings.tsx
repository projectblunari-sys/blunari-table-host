import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useTenant } from '@/hooks/useTenant';
import { useAdvancedBookings } from '@/hooks/useAdvancedBookings';
import BookingCard from '@/components/dashboard/BookingCard';
import AdvancedBookingStatusOverview from '@/components/booking/AdvancedBookingStatusOverview';
import SmartBookingWizard from '@/components/booking/SmartBookingWizard';
import AdvancedFilters from '@/components/booking/AdvancedFilters';
import { 
  Plus, 
  CalendarIcon,
  Calendar,
  CheckSquare,
  Square,
  Trash2,
  Send,
  Edit,
  MoreHorizontal,
  MessageSquare,
  Activity,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';

const Bookings: React.FC = () => {
  const { tenant, isLoading: tenantLoading } = useTenant();
  const {
    bookings,
    isLoading,
    filters,
    setFilters,
    selectedBookings,
    setSelectedBookings,
    bulkOperation,
    isBulkOperationPending,
    updateBooking
  } = useAdvancedBookings(tenant?.id);

  const [showWizard, setShowWizard] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Group bookings by status
  const bookingsByStatus = React.useMemo(() => {
    const groups = {
      confirmed: bookings.filter(b => b.status === 'confirmed'),
      pending: bookings.filter(b => b.status === 'pending'),
      seated: bookings.filter(b => b.status === 'seated'),
      completed: bookings.filter(b => b.status === 'completed'),
      cancelled: bookings.filter(b => b.status === 'cancelled'),
      noshow: bookings.filter(b => b.status === 'noshow'),
    };
    return groups;
  }, [bookings]);

  const currentBookings = selectedStatus === 'all' ? bookings : bookingsByStatus[selectedStatus as keyof typeof bookingsByStatus] || [];

  const statusCounts = {
    all: bookings.length,
    confirmed: bookingsByStatus.confirmed.length,
    pending: bookingsByStatus.pending.length,
    seated: bookingsByStatus.seated.length,
    completed: bookingsByStatus.completed.length,
    cancelled: bookingsByStatus.cancelled.length,
    noshow: bookingsByStatus.noshow.length,
  };

  // Calculate key metrics
  const todaysBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_time).toDateString();
    const today = new Date().toDateString();
    return bookingDate === today;
  });

  const metrics = {
    totalToday: todaysBookings.length,
    pendingToday: todaysBookings.filter(b => b.status === 'pending').length,
    confirmedToday: todaysBookings.filter(b => b.status === 'confirmed').length,
    totalGuests: todaysBookings.reduce((sum, b) => sum + b.party_size, 0),
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === currentBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(currentBookings.map(b => b.id));
    }
  };

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleBulkStatusUpdate = (status: string) => {
    bulkOperation({
      type: 'status_update',
      bookingIds: selectedBookings,
      data: { status }
    });
    setSelectedBookings([]);
  };

  const handleBulkNotification = () => {
    bulkOperation({
      type: 'send_notification',
      bookingIds: selectedBookings,
      data: { 
        type: 'reminder',
        template: 'booking_reminder' 
      }
    });
    setSelectedBookings([]);
  };

  const handleBulkDelete = () => {
    bulkOperation({
      type: 'delete',
      bookingIds: selectedBookings,
      data: {}
    });
    setSelectedBookings([]);
  };

  const handleExportCSV = () => {
    const bookingsToExport = selectedBookings.length > 0 
      ? currentBookings.filter(b => selectedBookings.includes(b.id))
      : currentBookings;
    
    bulkOperation({
      type: 'export',
      bookingIds: bookingsToExport.map(b => b.id),
      data: {}
    });
  };

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading restaurant data...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Restaurant Found</h3>
            <p className="text-muted-foreground">
              Please ensure you have a valid restaurant setup to view bookings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header with Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Booking Management</h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive booking lifecycle management with smart features
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
              <Activity className="h-4 w-4" />
              Real-time Updates
            </Badge>
            <Button 
              onClick={() => setShowWizard(true)}
              size="lg"
              className="shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Smart Booking
            </Button>
          </div>
        </div>

        {/* Today's Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Bookings</p>
                  <p className="text-2xl font-bold">{metrics.totalToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{metrics.pendingToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold">{metrics.confirmedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Guests</p>
                  <p className="text-2xl font-bold">{metrics.totalGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Advanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalBookings={bookings.length}
          onExportCSV={handleExportCSV}
        />
      </motion.div>

      {/* Enhanced Bulk Actions */}
      {selectedBookings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-md border-l-4 border-l-primary">
            <CardContent className="py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedBookings.length === currentBookings.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="font-semibold text-lg">
                    {selectedBookings.length} of {currentBookings.length} selected
                  </span>
                  <Badge variant="secondary">
                    Bulk Actions Available
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('confirmed')}
                    disabled={isBulkOperationPending}
                    className="shadow-sm"
                  >
                    {isBulkOperationPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckSquare className="h-4 w-4 mr-2" />
                    )}
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate('seated')}
                    disabled={isBulkOperationPending}
                    className="shadow-sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Seat
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkNotification}
                    disabled={isBulkOperationPending}
                    className="shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Notify
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isBulkOperationPending}
                        className="shadow-sm border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Bookings</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedBookings.length} booking(s)? 
                          This action cannot be undone and will permanently remove all booking data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleBulkDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Advanced Booking Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AdvancedBookingStatusOverview
          bookings={bookings}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          isLoading={isLoading}
        />
      </motion.div>

      {/* Smart Booking Wizard */}
      <SmartBookingWizard 
        open={showWizard}
        onOpenChange={setShowWizard}
      />
    </div>
  );
};

export default Bookings;