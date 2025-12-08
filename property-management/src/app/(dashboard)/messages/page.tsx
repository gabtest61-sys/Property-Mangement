'use client';

import { Header } from '@/components/layout';
import { Avatar, Badge, Input } from '@/components/ui';
import { Search, Send, Paperclip, Image, Mic, MoreVertical, Phone, Video, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const conversations = [
  {
    id: 1,
    name: 'Juan Cruz',
    lastMessage: 'Thank you for the quick response!',
    time: '2 min ago',
    unread: 2,
    online: true,
    property: 'Sunrise Apartments - Unit 203',
  },
  {
    id: 2,
    name: 'Maria Santos',
    lastMessage: 'When is the maintenance scheduled?',
    time: '15 min ago',
    unread: 0,
    online: true,
    property: 'Green Valley - Unit 105',
  },
  {
    id: 3,
    name: 'Pedro Garcia',
    lastMessage: "I'll send the payment tomorrow",
    time: '1 hour ago',
    unread: 1,
    online: false,
    property: 'Metro Heights - Unit 401',
  },
  {
    id: 4,
    name: 'Ana Reyes',
    lastMessage: 'The contract looks good',
    time: '3 hours ago',
    unread: 0,
    online: false,
    property: 'Sunrise Apartments - Unit 301',
  },
];

const messages = [
  {
    id: 1,
    sender: 'tenant',
    content: 'Hi, I wanted to ask about the water heater in my unit.',
    time: '10:30 AM',
    status: 'read',
  },
  {
    id: 2,
    sender: 'owner',
    content: "Hello Juan! What seems to be the problem with the water heater?",
    time: '10:32 AM',
    status: 'read',
  },
  {
    id: 3,
    sender: 'tenant',
    content: "It's not heating properly. The water stays lukewarm even after waiting.",
    time: '10:35 AM',
    status: 'read',
  },
  {
    id: 4,
    sender: 'owner',
    content: "I understand. I'll schedule a maintenance visit for tomorrow between 9-11 AM. Does that work for you?",
    time: '10:38 AM',
    status: 'read',
  },
  {
    id: 5,
    sender: 'tenant',
    content: 'Yes, that works perfectly. Thank you for the quick response!',
    time: '10:40 AM',
    status: 'delivered',
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [message, setMessage] = useState('');

  return (
    <>
      {/* Desktop Header - Hidden on mobile when conversation is selected */}
      <div className="hidden lg:block">
        <Header title="Messages" subtitle="Stay connected with your tenants" showSearch={false} />
      </div>

      <div className="flex h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)]">
        {/* Conversations List */}
        <div className="w-full lg:w-80 xl:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Input
              placeholder="Search conversations..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={cn(
                  'w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700',
                  selectedConversation.id === conv.id && 'bg-blue-50 dark:bg-blue-900/30'
                )}
              >
                <Avatar
                  name={conv.name}
                  size="md"
                  showOnlineStatus
                  isOnline={conv.online}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {conv.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                    {conv.property}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <Badge variant="primary" size="sm" className="ml-2">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden lg:flex flex-1 flex-col bg-gray-50 dark:bg-gray-900">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Avatar
                name={selectedConversation.name}
                size="md"
                showOnlineStatus
                isOnline={selectedConversation.online}
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedConversation.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedConversation.property}
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
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.sender === 'owner' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-2.5',
                    msg.sender === 'owner'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md shadow-sm dark:shadow-gray-900/30'
                  )}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div
                    className={cn(
                      'flex items-center gap-1 mt-1',
                      msg.sender === 'owner' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs',
                        msg.sender === 'owner'
                          ? 'text-blue-200'
                          : 'text-gray-400'
                      )}
                    >
                      {msg.time}
                    </span>
                    {msg.sender === 'owner' && (
                      msg.status === 'read' ? (
                        <CheckCheck className="h-3.5 w-3.5 text-blue-200" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-blue-200" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Image className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-11 px-4 pr-12 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                  <Mic className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Select a conversation message */}
        <div className="flex lg:hidden flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">Select a conversation to start messaging</p>
        </div>
      </div>
    </>
  );
}
