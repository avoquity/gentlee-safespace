
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
  // Find the first AI message index to show the insight after
  const findInsightTarget = () => {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].sender === 'ai') {
        console.log('Found AI message to show insight after at index:', i);
        return i; // Return index of first AI message
      }
    }
    console.log('No AI messages found for insight display');
    return -1; // No AI messages found
  };
  
  const insightTargetIndex = findInsightTarget();

  // Add debug logs for insight visibility
  useEffect(() => {
    if (shouldShowInsight) {
      console.log('Insight should be shown:', shouldShowInsight);
      console.log('Insight text:', insightText);
      console.log('Target message index:', insightTargetIndex);
      console.log('Message count:', messages.length);
    }
  }, [shouldShowInsight, insightText, insightTargetIndex, messages.length]);

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
