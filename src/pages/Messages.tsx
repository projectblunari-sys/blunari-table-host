import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import EmptyState from '@/components/ui/empty-state';

const Messages: React.FC = () => {
  const handleNewMessage = () => {
    console.log('Creating new message...');
  };

  const handleSetupIntegration = () => {
    console.log('Setting up messaging integration...');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Messages"
        description="Send and manage customer communications, notifications, and automated messages."
        primaryAction={{
          label: 'New Message',
          onClick: handleNewMessage,
          icon: Plus
        }}
        secondaryActions={[
          {
            label: 'Setup Integration',
            onClick: handleSetupIntegration,
            variant: 'outline'
          }
        ]}
      />

      <EmptyState
        illustration="inbox"
        title="No messages yet"
        description="Start communicating with your customers by sending your first message. You can send booking confirmations, promotional offers, and updates."
        action={{
          label: 'Send First Message',
          onClick: handleNewMessage,
          icon: Plus
        }}
        secondaryAction={{
          label: 'Setup Automation',
          onClick: handleSetupIntegration
        }}
      />
    </motion.div>
  );
};

export default Messages;