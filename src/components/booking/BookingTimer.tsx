import React, { useState, useEffect } from 'react';

interface BookingTimerProps {
  startTime: number;
}

const BookingTimer: React.FC<BookingTimerProps> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const getTimerColor = () => {
    const seconds = elapsed / 1000;
    if (seconds < 60) return 'text-green-600';
    if (seconds < 120) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <span className={`font-mono ${getTimerColor()}`}>
      {formatTime(elapsed)}
    </span>
  );
};

export default BookingTimer;