
import React, { useRef, useState, useEffect } from 'react';
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
  shouldShowInsight?: boolean;
  insightText?: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  highlights, 
  isTyping, 
  onHighlightChange, 
  onHighlightRemove,
  messagesEndRef,
  shouldShowInsight = false,
  insightText = ''
}: ChatMessagesProps) => {
  // Always display the insight after the first AI message
  // This ensures it appears early and stays visible
  const findInsightTarget = () => {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].sender === 'ai') {
        return i;
      }
    }
    return -1;
  };
  
  const insightTargetIndex = findInsightTarget();

  // Groups messages into sequence blocks
  const renderMessages = () => {
    return messages.map((message, index) => (
      <ChatMessage
        key={`msg-${message.id}`}
        message={message}
        highlights={highlights.filter(h => h.message_id.toString() === message.id)}
        onHighlightChange={onHighlightChange}
        onHighlightRemove={onHighlightRemove}
        showInsight={shouldShowInsight && index === insightTargetIndex}
        insightText={shouldShowInsight && index === insightTargetIndex ? insightText : ''}
      />
    ));
  };

  return (
    <div className="chat-messages-container space-y-8">
      {renderMessages()}
      {isTyping && <ChatTypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};
