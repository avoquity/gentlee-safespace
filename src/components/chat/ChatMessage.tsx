
import React from 'react';
import { Message } from '@/types/chat';

interface ChatMessageProps {
  message: Message;
  isFirstMessage?: boolean;
}

export const ChatMessage = ({ message, isFirstMessage }: ChatMessageProps) => {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-6 py-4 rounded-2xl ${
          message.sender === 'user' || !isFirstMessage ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
      >
        <p className="text-deep-charcoal text-[17px] leading-relaxed whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    </div>
  );
};
