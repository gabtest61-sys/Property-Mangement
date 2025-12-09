'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Conversation, Message, MessageInsert, Tenant, Property } from '@/lib/database.types';

export interface ConversationWithDetails extends Conversation {
  tenant: Tenant;
  property: Property | null;
  lastMessage?: Message;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          tenant:tenants (*),
          property:properties (*)
        `)
        .eq('owner_id', user.id)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;

      setConversations((data || []) as ConversationWithDetails[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async (tenantId: string, propertyId?: string): Promise<{ data: { id: string } | null; error: Error | null }> => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('owner_id', user.id)
        .eq('tenant_id', tenantId)
        .single();

      if (existing) {
        return { data: existing as { id: string }, error: null };
      }

      const conversationData = { owner_id: user.id, tenant_id: tenantId, property_id: propertyId };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('conversations') as any)
        .insert(conversationData)
        .select('id')
        .single();

      if (insertError) throw insertError;

      await fetchConversations();
      return { data: data as { id: string }, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const archiveConversation = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('conversations') as any)
        .update({ is_archived: true })
        .eq('id', id);

      if (updateError) throw updateError;

      await fetchConversations();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('conversations') as any)
        .update({ owner_unread_count: 0 })
        .eq('id', id);

      if (updateError) throw updateError;

      // Also mark all messages as read
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('messages') as any)
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', id)
        .eq('sender_type', 'tenant')
        .eq('is_read', false);

      await fetchConversations();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.owner_unread_count, 0);

  return {
    conversations,
    isLoading,
    error,
    fetchConversations,
    createConversation,
    archiveConversation,
    markAsRead,
    totalUnread,
  };
}

export function useMessages(conversationId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages((data || []) as Message[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const sendMessage = async (content: string, messageType: Message['message_type'] = 'text') => {
    if (!user || !conversationId) return { error: new Error('Not authenticated') };

    try {
      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_type: 'owner',
        sender_id: user.id,
        content,
        message_type: messageType,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('messages') as any)
        .insert(messageData)
        .select()
        .single();

      if (insertError) throw insertError;

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const sendAttachment = async (
    attachmentUrl: string,
    attachmentName: string,
    attachmentType: string,
    attachmentSize: number
  ) => {
    if (!user || !conversationId) return { error: new Error('Not authenticated') };

    try {
      const messageType = attachmentType.startsWith('image/') ? 'image' : 'file';

      const messageData: MessageInsert = {
        conversation_id: conversationId,
        sender_type: 'owner',
        sender_id: user.id,
        message_type: messageType,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        attachment_size: attachmentSize,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: insertError } = await (supabase.from('messages') as any)
        .insert(messageData)
        .select()
        .single();

      if (insertError) throw insertError;

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err as Error };
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from('messages') as any)
        .update({ is_deleted: true })
        .eq('id', id);

      if (updateError) throw updateError;

      setMessages((prev) => prev.filter((m) => m.id !== id));
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return {
    messages,
    isLoading,
    error,
    fetchMessages,
    sendMessage,
    sendAttachment,
    deleteMessage,
  };
}
