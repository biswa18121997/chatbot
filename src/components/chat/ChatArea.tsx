import React, { useEffect, useRef } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageInput } from './MessageInput';
import type { Message } from '../../types';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isTyping?: boolean;
  isLoading?: boolean;
  chatTitle?: string;
}

export function ChatArea({
  messages,
  onSendMessage,
  isTyping = false,
  isLoading = false,
  chatTitle = 'Select a chat',
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{chatTitle}</h2>
              <p className="text-sm text-slate-500">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-slate-500 mb-6">
              Send a message to begin chatting with the AI assistant. Ask anything you'd like to know!
            </p>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg text-left">
                <p className="font-medium text-slate-700">💡 Tip:</p>
                <p className="text-slate-600">Try asking about coding, writing, or general questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={onSendMessage}
          disabled={isLoading}
          placeholder="Ask me anything..."
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{chatTitle}</h2>
            <p className="text-sm text-slate-500">
              {isTyping ? 'AI is typing...' : 'AI Assistant'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="space-y-1">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        disabled={isLoading || isTyping}
      />
    </div>
  );
}