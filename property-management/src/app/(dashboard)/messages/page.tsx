'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Header } from '@/components/layout';
import { Avatar, Badge, Input, Button, Modal, Select } from '@/components/ui';
import {
  Search,
  Send,
  Paperclip,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  Plus,
  ArrowLeft,
  Download,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConversations, useMessages } from '@/hooks/useMessages';
import { useTenants } from '@/hooks/useTenants';
import { usePremium } from '@/hooks/usePremium';
import { ConversationWithDetails } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { generateChatExportPDF } from '@/lib/pdf';

export default function MessagesPage() {
  const { conversations, isLoading, createConversation, markAsRead, totalUnread } =
    useConversations();
  const { tenants } = useTenants('active');

  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTenantId, setNewChatTenantId] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Determine the active conversation - prefer selected, fallback to first
  const activeConversation = selectedConversation ?? (conversations.length > 0 ? conversations[0] : null);

  const handleSelectConversation = async (conv: ConversationWithDetails) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
    if (conv.owner_unread_count > 0) {
      await markAsRead(conv.id);
    }
  };

  const handleCreateConversation = async () => {
    if (!newChatTenantId) return;

    setIsCreatingChat(true);
    const { data, error } = await createConversation(newChatTenantId);

    if (!error && data) {
      setIsNewChatModalOpen(false);
      setNewChatTenantId('');
      // Find and select the new/existing conversation
      const conv = conversations.find((c) => c.id === data.id);
      if (conv) {
        setSelectedConversation(conv);
        setShowMobileChat(true);
      }
    }
    setIsCreatingChat(false);
  };

  const filteredConversations = conversations.filter((conv) => {
    const tenantName = `${conv.tenant.first_name} ${conv.tenant.last_name}`.toLowerCase();
    return tenantName.includes(searchQuery.toLowerCase());
  });

  // Get tenants who don't have conversations yet
  const tenantsWithoutChat = tenants.filter(
    (tenant) => !conversations.some((conv) => conv.tenant_id === tenant.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header
          title="Messages"
          subtitle={totalUnread > 0 ? `${totalUnread} unread messages` : 'Stay connected with your tenants'}
          showSearch={false}
          actions={
            <Button onClick={() => setIsNewChatModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          }
        />
      </div>

      <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)]">
        {/* Conversations List */}
        <div
          className={cn(
            'w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900',
            showMobileChat && 'hidden lg:flex'
          )}
        >
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center gap-2 lg:hidden">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex-1">
                Messages
              </h1>
              <Button size="sm" onClick={() => setIsNewChatModalOpen(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Search conversations..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                {!searchQuery && (
                  <Button className="mt-3" size="sm" onClick={() => setIsNewChatModalOpen(true)}>
                    Start a conversation
                  </Button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700',
                    activeConversation?.id === conv.id && 'bg-blue-50 dark:bg-blue-900/30'
                  )}
                >
                  <Avatar name={`${conv.tenant.first_name} ${conv.tenant.last_name}`} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {conv.tenant.first_name} {conv.tenant.last_name}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                        {conv.last_message_at
                          ? new Date(conv.last_message_at).toLocaleDateString()
                          : 'New'}
                      </span>
                    </div>
                    {conv.property && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                        {conv.property.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conv.last_message_preview || 'Start a conversation'}
                      </p>
                      {conv.owner_unread_count > 0 && (
                        <Badge variant="primary" size="sm" className="ml-2">
                          {conv.owner_unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            onBack={() => setShowMobileChat(false)}
            showMobileChat={showMobileChat}
          />
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        title="Start New Conversation"
        description="Select a tenant to start chatting"
      >
        <div className="space-y-4">
          <Select
            label="Select Tenant"
            value={newChatTenantId}
            onChange={(e) => setNewChatTenantId(e.target.value)}
          >
            <option value="">Choose a tenant...</option>
            {tenantsWithoutChat.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.first_name} {tenant.last_name} - {tenant.phone}
              </option>
            ))}
          </Select>

          {tenantsWithoutChat.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              All tenants already have active conversations.
            </p>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewChatModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!newChatTenantId || isCreatingChat}
              className="flex-1"
            >
              {isCreatingChat ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Start Chat
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

interface ChatAreaProps {
  conversation: ConversationWithDetails;
  onBack: () => void;
  showMobileChat: boolean;
}

function ChatArea({ conversation, onBack, showMobileChat }: ChatAreaProps) {
  const { messages, isLoading, sendMessage } = useMessages(conversation.id);
  const { profile } = useAuth();
  const { hasFeature } = usePremium();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    const { error } = await sendMessage(messageText.trim());

    if (!error) {
      setMessageText('');
    }
    setIsSending(false);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const handleExportChat = () => {
    if (!hasFeature('chatExport')) {
      setIsUpgradeModalOpen(true);
      return;
    }

    const ownerName = profile?.full_name || 'Property Owner';
    const tenantName = `${conversation.tenant.first_name} ${conversation.tenant.last_name}`;

    const pdf = generateChatExportPDF(
      `Chat with ${tenantName}`,
      messages,
      { owner: ownerName, tenant: tenantName }
    );
    pdf.save(`chat-${tenantName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div
      className={cn(
        'flex-1 flex-col bg-gray-50 dark:bg-gray-900',
        showMobileChat ? 'flex' : 'hidden lg:flex'
      )}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <Avatar
            name={`${conversation.tenant.first_name} ${conversation.tenant.last_name}`}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {conversation.tenant.first_name} {conversation.tenant.last_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {conversation.property?.name || conversation.tenant.phone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Video className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <button
            onClick={handleExportChat}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
            title={hasFeature('chatExport') ? 'Export chat to PDF' : 'Premium feature'}
          >
            <Download className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            {!hasFeature('chatExport') && (
              <Crown className="h-3 w-3 text-amber-500 absolute -top-0.5 -right-0.5" />
            )}
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageCircle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.sender_type === 'owner' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2.5',
                  msg.sender_type === 'owner'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm dark:shadow-gray-900/30'
                )}
              >
                {msg.message_type === 'text' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : msg.message_type === 'image' ? (
                  <Image
                    src={msg.attachment_url || ''}
                    alt={msg.attachment_name || 'Image attachment'}
                    width={300}
                    height={200}
                    className="max-w-full rounded-lg"
                    unoptimized
                  />
                ) : (
                  <a
                    href={msg.attachment_url || ''}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm underline"
                  >
                    <Paperclip className="h-4 w-4" />
                    {msg.attachment_name || 'Attachment'}
                  </a>
                )}
                <div
                  className={cn(
                    'flex items-center gap-1 mt-1',
                    msg.sender_type === 'owner' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs',
                      msg.sender_type === 'owner' ? 'text-blue-200' : 'text-gray-400'
                    )}
                  >
                    {formatMessageTime(msg.created_at)}
                  </span>
                  {msg.sender_type === 'owner' &&
                    (msg.is_read ? (
                      <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-blue-200" />
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ImageIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              disabled={isSending}
              className="w-full h-11 px-4 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {/* Premium Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Premium Feature"
        description="Chat export requires a Premium subscription"
      >
        <div className="text-center py-4">
          <div className="h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
            <Download className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Export Chat History to PDF
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Premium members can export chat conversations for record-keeping and documentation.
          </p>
          <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Export full conversation history
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Include timestamps and sender info
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Professional PDF format
            </li>
          </ul>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsUpgradeModalOpen(false)}
            >
              Maybe Later
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => {
                setIsUpgradeModalOpen(false);
                window.location.href = '/settings?section=billing';
              }}
            >
              <Crown className="h-4 w-4" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
