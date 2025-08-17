import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.is_bot;

  return (
    <div className={clsx('flex gap-3 p-4', {
      'justify-start': isBot,
      'justify-end': !isBot,
    })}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={clsx('max-w-[70%] space-y-1', {
        'order-first': !isBot,
      })}>
        <div
          className={clsx('px-4 py-3 rounded-2xl shadow-sm', {
            'bg-gradient-to-r from-blue-500 to-blue-600 text-white': !isBot,
            'bg-white border border-slate-200 text-slate-900': isBot,
          })}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>
        
        <p className={clsx('text-xs px-2', {
          'text-slate-500': isBot,
          'text-slate-400 text-right': !isBot,
        })}>
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </p>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}