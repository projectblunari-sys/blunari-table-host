import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Edit, Move, MessageCircle, Calendar, Clock, Users, MapPin, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { format, parseISO } from 'date-fns';
import type { Reservation, Policy } from './types';

interface ReservationDrawerProps {
  open: boolean;
  reservation?: Reservation | null;
  policy?: Policy;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onMove: () => void;
  onMessage: () => void;
  onCancel: () => Promise<void>;
}

export function ReservationDrawer({
  open,
  reservation,
  policy,
  onOpenChange,
  onEdit,
  onMove,
  onMessage,
  onCancel
}: ReservationDrawerProps) {
  const [activeTab, setActiveTab] = useState('edit');

  if (!reservation) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Confirmed</Badge>;
      case 'seated':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Seated</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      return format(parseISO(isoString), 'h:mm a');
    } catch {
      return isoString;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[400px] glass-strong border-l border-white/20 p-0 flex flex-col"
      >
        <SheetHeader className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-[hsl(var(--accent))] text-white font-medium">
                  {getInitials(reservation.guestName)}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <SheetTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  Guest {reservation.guestName}
                  {reservation.vip && (
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  )}
                </SheetTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Party {reservation.partySize}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(reservation.start)}–{formatTime(reservation.end)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Table {reservation.tableId} ({reservation.section})
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button 
              className="bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent-2))] hover:opacity-90 text-white border-0"
              onClick={onEdit}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" className="glass border-white/10" onClick={onMove}>
              <Move className="mr-2 h-4 w-4" />
              Move
            </Button>
            <Button variant="outline" className="glass border-white/10" onClick={onMessage}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button 
              variant="outline" 
              className="glass border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-5 m-4 mb-0 glass">
              <TabsTrigger value="edit" className="text-xs">Edit</TabsTrigger>
              <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs">Payments</TabsTrigger>
              <TabsTrigger value="guest" className="text-xs">Guest</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <TabsContent value="edit" className="p-4 space-y-4 m-0">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Party Size</label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {reservation.partySize} guests
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Time</label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatTime(reservation.start)} - {formatTime(reservation.end)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Table</label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Table {reservation.tableId} in {reservation.section}
                    </div>
                  </div>

                  {reservation.specialRequests && (
                    <div>
                      <label className="text-sm font-medium text-foreground">Special Requests</label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {reservation.specialRequests}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="details" className="p-4 space-y-4 m-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking ID</span>
                    <span className="text-sm font-mono">{reservation.id.slice(0, 8)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Channel</span>
                    <Badge variant="secondary">{reservation.channel}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">VIP</span>
                    <Badge variant={reservation.vip ? "default" : "secondary"}>
                      {reservation.vip ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="p-4 m-0">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    No recent activity
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments" className="p-4 space-y-4 m-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">Deposit</div>
                      <div className="text-xs text-muted-foreground">
                        {policy?.depositsEnabled ? 'Policy enabled' : 'If policy disabled'}
                      </div>
                    </div>
                    <Switch 
                      checked={reservation.depositRequired && policy?.depositsEnabled}
                      disabled={!policy?.depositsEnabled}
                    />
                  </div>
                  
                  {!policy?.depositsEnabled && (
                    <div className="text-xs text-muted-foreground italic">
                      Deposits are currently disabled for this venue
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="guest" className="p-4 space-y-4 m-0">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Name</label>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {reservation.guestName}
                    </div>
                  </div>
                  
                  {reservation.guestEmail && (
                    <div>
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {reservation.guestEmail}
                      </div>
                    </div>
                  )}
                  
                  {reservation.guestPhone && (
                    <div>
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {reservation.guestPhone}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}