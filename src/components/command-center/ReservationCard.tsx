import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Reservation } from './types';

interface ReservationCardProps {
  reservation: Reservation;
  onClick: () => void;
}

export function ReservationCard({ reservation, onClick }: ReservationCardProps) {
  const getChannelBadge = (channel: Reservation['channel']) => {
    switch (channel) {
      case 'WEB':
        return <Badge variant="secondary" className="h-4 px-1 text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">Web</Badge>;
      case 'PHONE':
        return <Badge variant="secondary" className="h-4 px-1 text-xs bg-gray-500/20 text-gray-300 border-gray-500/30">Phone</Badge>;
      case 'WALKIN':
        return <Badge variant="secondary" className="h-4 px-1 text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">Walk</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/80 border-blue-400';
      case 'seated':
        return 'bg-purple-500/80 border-purple-400';
      case 'completed':
        return 'bg-green-500/80 border-green-400';
      case 'cancelled':
        return 'bg-red-500/80 border-red-400';
      default:
        return 'bg-gray-500/80 border-gray-400';
    }
  };

  return (
    <div
      className={`
        h-full w-full rounded-md border cursor-pointer
        hover:scale-105 transition-all duration-200
        flex items-center justify-between px-2 text-white text-xs
        ${getStatusColor(reservation.status)}
      `}
      onClick={onClick}
    >
      <div className="flex items-center gap-1 min-w-0 flex-1">
        <span className="truncate font-medium">
          {reservation.guestName}
        </span>
        {reservation.vip && (
          <Star className="h-3 w-3 text-yellow-400 fill-current flex-shrink-0" />
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        <Badge variant="secondary" className="h-4 px-1 text-xs bg-white/20 text-white border-white/30">
          P{reservation.partySize}
        </Badge>
        {getChannelBadge(reservation.channel)}
      </div>
    </div>
  );
}