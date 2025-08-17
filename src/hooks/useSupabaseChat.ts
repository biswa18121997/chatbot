import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Chat = Database['public']['Tables']['chats']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];

export function useSupabaseChat(userId: string | undefined) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Load chats
  useEffect(() => {
    if (!userId) return;

    const loadChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading chats:', error);
      } else {
        setChats(data || []);
      }
      setIsLoading(false);
    };

    loadChats();

    // Subscribe to chat changes
    const chatsSubscription = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      chatsSubscription.unsubscribe();
    };
  }, [userId]);

  // Load messages for current chat
  useEffect(() => {
    if (!currentChatId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages(data || []);
      }
    };

    loadMessages();

    // Subscribe to message changes
    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${currentChatId}`,
        },
        () => {
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [currentChatId]);

  const createNewChat = async (title: string = 'New Chat') => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('chats')
      .insert({
        title,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }

    setCurrentChatId(data.id);
    return data;
  };

  const sendMessage = async (content: string) => {
    if (!currentChatId || !userId) return;

    try {
      // Save user message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          user_id: userId,
          content,
          is_bot: false,
        });

      if (messageError) {
        console.error('Error saving message:', messageError);
        return;
      }

      // Update chat timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentChatId);

      // Call edge function for bot response
      setIsTyping(true);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-message`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: currentChatId,
            content,
          }),
        }
      );

      const result = await response.json();
      
      if (!result.success) {
        console.error('Bot response error:', result.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      return;
    }

    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const currentChat = chats.find(chat => chat.id === currentChatId) || null;

  return {
    chats,
    currentChat,
    messages,
    currentChatId,
    isLoading,
    isTyping,
    setCurrentChatId,
    createNewChat,
    sendMessage,
    deleteChat,
  };
}