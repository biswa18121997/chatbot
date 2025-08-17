import React from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatArea } from './ChatArea';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';

export function ChatInterface() {
  const { user } = useAuth();
  const {
    chats,
    currentChat,
    messages,
    currentChatId,
    isTyping,
    isLoading,
    setCurrentChatId,
    createNewChat,
    sendUserMessage,
    deleteChatById,
  } = useChat(user?.id || '');

  const handleNewChat = async () => {
    const title = `Chat ${new Date().toLocaleString()}`;
    await createNewChat(title);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId) {
      // Create new chat if none selected
      await handleNewChat();
      // The new chat will be set as current, but we need to wait for it
      setTimeout(() => {
        sendUserMessage(content);
      }, 100);
    } else {
      await sendUserMessage(content);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={setCurrentChatId}
        onNewChat={handleNewChat}
        onDeleteChat={deleteChatById}
        isLoading={isLoading}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <ChatArea
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          isLoading={isLoading}
          chatTitle={currentChat?.title || 'New Chat'}
        />
      </div>
    </div>
  );
}