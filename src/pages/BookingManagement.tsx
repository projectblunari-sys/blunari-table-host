import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTenant } from '@/hooks/useTenant';
import { useRealtimeBookings } from '@/hooks/useRealtimeBookings';
import BookingCard from '@/components/dashboard/BookingCard';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  Phone,
  Mail
} from 'lucide-react';

const BookingManagement: React.FC = () => {
  const { tenant } = useTenant();
  const { bookings, isLoading, isConnected } = useRealtimeBookings(tenant?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter bookings based on search term and status
  const filteredBookings = React.useMemo(() => {
    if (!bookings) return [];
    
    return bookings.filter(booking => {
      const matchesSearch = booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           booking.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (booking.guest_phone && booking.guest_phone.includes(searchTerm));
      
      const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, selectedStatus]);

  // Group bookings by status
  const bookingsByStatus = React.useMemo(() => {
    const groups = {
      confirmed: filteredBookings.filter(b => b.status === 'confirmed'),
      seated: filteredBookings.filter(b => b.status === 'seated'),
      completed: filteredBookings.filter(b => b.status === 'completed'),
      cancelled: filteredBookings.filter(b => b.status === 'cancelled'),
      no_show: filteredBookings.filter(b => b.status === 'no_show'),
    };
    return groups;
  }, [filteredBookings]);

  const statusCounts = {
    all: filteredBookings.length,
    confirmed: bookingsByStatus.confirmed.length,
    seated: bookingsByStatus.seated.length,
    completed: bookingsByStatus.completed.length,
    cancelled: bookingsByStatus.cancelled.length,
    no_show: bookingsByStatus.no_show.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage all your restaurant reservations and walk-ins
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Live Updates' : 'Offline'}
          </Badge>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Status Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All
              <Badge variant="secondary" className="text-xs">
                {statusCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              Confirmed
              <Badge variant="secondary" className="text-xs">
                {statusCounts.confirmed}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="seated" className="flex items-center gap-2">
              Seated
              <Badge variant="secondary" className="text-xs">
                {statusCounts.seated}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              Completed
              <Badge variant="secondary" className="text-xs">
                {statusCounts.completed}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              Cancelled
              <Badge variant="secondary" className="text-xs">
                {statusCounts.cancelled}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="no_show" className="flex items-center gap-2">
              No Show
              <Badge variant="secondary" className="text-xs">
                {statusCounts.no_show}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <BookingsList bookings={filteredBookings} isLoading={isLoading} />
          </TabsContent>
          
          {Object.entries(bookingsByStatus).map(([status, statusBookings]) => (
            <TabsContent key={status} value={status} className="mt-6">
              <BookingsList bookings={statusBookings} isLoading={isLoading} />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
};

// Bookings List Component
const BookingsList: React.FC<{ bookings: any[]; isLoading: boolean }> = ({ 
  bookings, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            No bookings match your current search criteria. Try adjusting your filters or search terms.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map((booking, index) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <BookingCard booking={booking} />
        </motion.div>
      ))}
    </div>
  );
};

export default BookingManagement;