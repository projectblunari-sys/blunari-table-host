import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InboxList } from '@/components/messages/InboxList';
import { ConversationPane } from '@/components/messages/ConversationPane';
import { MessageComposer } from '@/components/messages/MessageComposer';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { Conversation, Message, MessageTemplate } from '@/types/messages';
import { toast } from '@/lib/toast';
import EmptyState from '@/components/ui/empty-state';

const Messages: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock current user ID - in real app, get from auth context
  const currentUserId = 'staff-1';

  // Mock data - in real app, fetch from API
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv-1',
        customer_id: 'customer-1',
        customer_name: 'John Smith',
        customer_email: 'john@example.com',
        customer_phone: '+1234567890',
        customer_avatar: '',
        subject: 'Booking Confirmation',
        last_message: 'Thank you for confirming my reservation.',
        last_message_at: new Date().toISOString(),
        unread_count: 2,
        status: 'active',
        participants: [
          { id: 'customer-1', name: 'John Smith', type: 'customer' },
          { id: 'staff-1', name: 'Restaurant Staff', type: 'staff' },
        ],
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'conv-2',
        customer_name: 'Jane Doe',
        customer_email: 'jane@example.com',
        customer_avatar: '',
        subject: 'Special Dietary Requirements',
        last_message: 'We can definitely accommodate gluten-free options.',
        last_message_at: new Date(Date.now() - 3600000).toISOString(),
        unread_count: 0,
        status: 'active',
        participants: [
          { id: 'customer-2', name: 'Jane Doe', type: 'customer' },
          { id: 'staff-1', name: 'Restaurant Staff', type: 'staff' },
        ],
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender_id: 'customer-1',
        sender_type: 'customer',
        sender_name: 'John Smith',
        content: 'Hi, I wanted to confirm my reservation for tomorrow evening.',
        message_type: 'text',
        status: 'read',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'msg-2',
        conversation_id: 'conv-1',
        sender_id: 'staff-1',
        sender_type: 'staff',
        sender_name: 'Restaurant Staff',
        content: 'Hello John! Yes, your reservation for 4 people at 7:30 PM is confirmed. We look forward to seeing you!',
        message_type: 'text',
        status: 'read',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'msg-3',
        conversation_id: 'conv-1',
        sender_id: 'customer-1',
        sender_type: 'customer',
        sender_name: 'John Smith',
        content: 'Thank you for confirming my reservation.',
        message_type: 'text',
        status: 'sent',
        created_at: new Date().toISOString(),
      },
    ];

    // Mock templates - only show if API returns them
    const mockTemplates: MessageTemplate[] = [
      {
        id: 'template-1',
        name: 'Booking Confirmation',
        subject: 'Your reservation is confirmed',
        content: 'Hello {{customer_name}}, your reservation for {{party_size}} people on {{date}} at {{time}} is confirmed.',
        category: 'confirmation',
        variables: ['customer_name', 'party_size', 'date', 'time'],
      },
      {
        id: 'template-2',
        name: 'Reminder - 24 Hours',
        subject: 'Reminder: Your reservation tomorrow',
        content: 'Hi {{customer_name}}, this is a friendly reminder about your reservation tomorrow at {{time}}.',
        category: 'reminder',
        variables: ['customer_name', 'time'],
      },
    ];

    setTimeout(() => {
      setConversations(mockConversations);
      setMessages(mockMessages);
      // Only set templates if they exist in the "API response"
      if (Math.random() > 0.3) { // Simulate 70% chance of having templates
        setTemplates(mockTemplates);
      }
      setIsLoading(false);
      
      // Auto-select first conversation if exists
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0].id);
      }
    }, 1000);
  }, []);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    // Mark messages as read
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, unread_count: 0 } : conv
      )
    );
  };

  const handleArchiveConversation = (id: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, status: 'archived' as const } : conv
      )
    );
    toast.success('Conversation archived');
  };

  const handleSendMessage = (content: string, templateId?: string) => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: selectedConversation,
      sender_id: currentUserId,
      sender_type: 'staff',
      sender_name: 'Restaurant Staff',
      content,
      message_type: templateId ? 'template' : 'text',
      template_id: templateId,
      status: 'sent',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversation
          ? {
              ...conv,
              last_message: content,
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : conv
      )
    );

    toast.success('Message sent');
  };

  const handleCreateConversation = (data: {
    to: string;
    subject: string;
    content: string;
    templateId?: string;
  }) => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      customer_name: data.to,
      customer_email: data.to.includes('@') ? data.to : '',
      subject: data.subject,
      last_message: data.content,
      last_message_at: new Date().toISOString(),
      unread_count: 0,
      status: 'active',
      participants: [
        { id: `customer-${Date.now()}`, name: data.to, type: 'customer' },
        { id: currentUserId, name: 'Restaurant Staff', type: 'staff' },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation.id);
    handleSendMessage(data.content, data.templateId);
    toast.success('Conversation created');
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = messages.filter(m => m.conversation_id === selectedConversation);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-text-muted">Loading messages...</p>
        </div>
      </motion.div>
    );
  }

  if (conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <EmptyState
          illustration="inbox"
          title="No messages yet"
          description="Start communicating with your customers by sending your first message. You can send booking confirmations, promotional offers, and updates."
          action={{
            label: 'Send First Message',
            onClick: () => setShowNewConversation(true),
            icon: Plus
          }}
          secondaryAction={{
            label: 'Setup Integration',
            onClick: () => console.log('Setup integration...')
          }}
        />
        
        <NewConversationDialog
          open={showNewConversation}
          onOpenChange={setShowNewConversation}
          templates={templates}
          onCreateConversation={handleCreateConversation}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-120px)] flex gap-6"
    >
      {/* Inbox List */}
      <div className="w-1/3 min-w-[300px]">
        <InboxList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onArchiveConversation={handleArchiveConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col gap-4">
        {selectedConversationData ? (
          <>
            <div className="flex-1">
              <ConversationPane
                conversation={selectedConversationData}
                messages={conversationMessages}
                currentUserId={currentUserId}
              />
            </div>
            
            <MessageComposer
              templates={templates}
              onSendMessage={handleSendMessage}
              showTemplates={templates.length > 0}
              maxLength={1000}
            />
          </>
        ) : (
          <Card className="flex-1 flex items-center justify-center bg-surface border-surface-2">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-h4 font-medium text-text mb-2">
                Select a conversation
              </h3>
              <p className="text-body-sm text-text-muted">
                Choose a conversation from the inbox to start messaging
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Floating Compose Button */}
      <Button
        onClick={() => setShowNewConversation(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elev-3 z-50"
        size="lg"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        templates={templates}
        onCreateConversation={handleCreateConversation}
      />
    </motion.div>
  );
};

export default Messages;