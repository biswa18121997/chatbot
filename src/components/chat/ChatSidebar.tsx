import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Plus, MessageCircle, Trash2, Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Chat } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { clsx } from 'clsx';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isLoading?: boolean;
}

export function ChatSidebar({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
  isLoading = false,
}: ChatSidebarProps) {
  const { user, signOut } = useAuth();
  const [hoveredChat, setHoveredChat] = useState<string | null>(null);

  return (
    <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-slate-900">Chats</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNewChat}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>

        {user && (
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse space-y-3 w-full">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 rounded-lg" />
              ))}
            </div>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No chats yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Create your first chat to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={clsx(
                  'group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-white border-2',
                  {
                    'bg-white border-blue-200 shadow-sm': chat.id === currentChatId,
                    'bg-transparent border-transparent hover:border-slate-200': chat.id !== currentChatId,
                  }
                )}
                onClick={() => onChatSelect(chat.id)}
                onMouseEnter={() => setHoveredChat(chat.id)}
                onMouseLeave={() => setHoveredChat(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 truncate text-sm">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                    </p>
                    {chat.messages?.[0] && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {chat.messages[0].is_bot ? '🤖 ' : '💬 '}
                        {chat.messages[0].content}
                      </p>
                    )}
                  </div>
                  
                  {hoveredChat === chat.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}