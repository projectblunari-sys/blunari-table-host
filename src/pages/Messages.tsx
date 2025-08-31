import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTenant } from '@/hooks/useTenant';
import { EmptyState, ErrorState } from '@/components/ui/state';
import { SkeletonMessagesDashboard } from '@/components/ui/skeleton-dashboard';
import { Conversation, Message, MessageTemplate } from '@/types/messages';
import { Plus, MessageSquare } from 'lucide-react';

const Messages: React.FC = () => {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real data loading - replace with API calls when backend is ready
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with real API calls
        // const response = await fetch('/api/messages/conversations');
        // const data = await response.json();
        
        // For now, show empty state until real data is available
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
        setIsLoading(false);
      }
    };

    if (tenant?.id) {
      loadData();
    }
  }, [tenant?.id]);

  // Loading state
  if (isLoading) {
    return <SkeletonMessagesDashboard />;
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          variant="server-error"
          title="Failed to load messages"
          description="We encountered an error while loading your messages. Please try again."
          error={error}
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  // Empty state - no messages yet (real state until backend is connected)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-12rem)] flex items-center justify-center p-6"
    >
      <EmptyState
        variant="feature-unavailable"
        title="Messages coming soon"
        description="Customer messaging features will be available once the backend integration is complete."
      />
    </motion.div>
  );
};

export default Messages;