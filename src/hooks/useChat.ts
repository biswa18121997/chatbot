import { useState, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_CHATS, GET_CHAT_DETAILS } from '../lib/graphql/queries';
import { CREATE_CHAT, SEND_MESSAGE, SEND_MESSAGE_TO_BOT, DELETE_CHAT } from '../lib/graphql/mutations';
import { MESSAGES_SUBSCRIPTION } from '../lib/graphql/subscriptions';
import type { Chat, Message } from '../types';

export function useChat(userId: string) {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const { data: chatsData, loading: chatsLoading, refetch: refetchChats } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    skip: !userId,
  });

  const { data: currentChatData, loading: chatLoading } = useQuery(GET_CHAT_DETAILS, {
    variables: { chat_id: currentChatId },
    skip: !currentChatId,
  });

  const { data: messagesData } = useSubscription(MESSAGES_SUBSCRIPTION, {
    variables: { chat_id: currentChatId },
    skip: !currentChatId,
  });

  const [createChat] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      setCurrentChatId(data.insert_chats_one.id);
      refetchChats();
    },
  });

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onCompleted: () => {
      // Message will be updated via subscription
    },
  });

  const [sendMessageToBot] = useMutation(SEND_MESSAGE_TO_BOT, {
    onCompleted: () => {
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => {
      refetchChats();
      setCurrentChatId(null);
    },
  });

  const chats: Chat[] = chatsData?.chats || [];
  const currentChat: Chat | null = currentChatData?.chats_by_pk || null;
  const messages: Message[] = messagesData?.messages || currentChat?.messages || [];

  const createNewChat = async (title: string = 'New Chat') => {
    try {
      await createChat({
        variables: { title, user_id: userId },
      });
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const sendUserMessage = async (content: string) => {
    if (!currentChatId) return;

    try {
      // Send user message
      await sendMessage({
        variables: {
          chat_id: currentChatId,
          user_id: userId,
          content,
        },
      });

      // Trigger bot response
      setIsTyping(true);
      await sendMessageToBot({
        variables: {
          chatId: currentChatId,
          content,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const deleteChatById = async (chatId: string) => {
    try {
      await deleteChat({
        variables: { chat_id: chatId },
      });
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return {
    chats,
    currentChat,
    messages,
    currentChatId,
    isTyping,
    isLoading: chatsLoading || chatLoading,
    setCurrentChatId,
    createNewChat,
    sendUserMessage,
    deleteChatById,
  };
}