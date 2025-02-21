
import React from 'react';
import { Message, Highlight } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatTypingIndicator } from './ChatTypingIndicator';

interface ChatMessagesProps {
  messages: Message[];
  highlights: Highlight[];
  isTyping: boolean;
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatMessages = ({ 
  messages, 
  highlights, 
  isTyping, 
  onHighlightChange, 
  onHighlightRemove,
  messagesEndRef 
}: ChatMessagesProps) => {
  return (
    <div className="chat-messages-container space-y-8">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message}
          highlights={highlights.filter(h => h.message_id.toString() === message.id)}
          onHighlightChange={onHighlightChange}
          onHighlightRemove={onHighlightRemove}
        />
      ))}
      {isTyping && <ChatTypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};
