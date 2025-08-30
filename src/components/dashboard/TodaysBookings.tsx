import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingCard from "./BookingCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTodaysBookings } from "@/hooks/useRealtimeBookings";
import { useTenant } from "@/hooks/useTenant";
import { Skeleton } from "@/components/ui/skeleton";

const TodaysBookings = () => {
  const { tenant } = useTenant();
  const { bookings, isLoading } = useTodaysBookings(tenant?.id);

  const getBookingStats = () => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const seated = bookings.filter(b => b.status === 'seated').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const total = bookings.length;

    return { confirmed, seated, completed, total };
  };

  const stats = getBookingStats();

  if (isLoading) {
    return (
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today's Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Bookings</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {stats.total} Total
            </Badge>
            <Badge variant="outline" className="bg-success/10 text-success">
              {stats.seated} Seated
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bookings for today
              </div>
            ) : (
              bookings.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={{
                    id: booking.id,
                    customerName: booking.guest_name,
                    time: new Date(booking.booking_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }),
                    guests: booking.party_size,
                    table: booking.table_id || 'Unassigned',
                    phone: booking.guest_phone || '',
                    status: booking.status as any,
                    specialRequests: booking.special_requests
                  }}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TodaysBookings;