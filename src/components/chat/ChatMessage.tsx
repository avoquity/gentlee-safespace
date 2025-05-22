
import React from 'react';
import { Message, Highlight } from '@/types/chat';
import { HighlightedText } from './HighlightedText';
import { InsightCard } from './InsightCard';

interface ChatMessageProps {
  message: Message;
  highlights: Highlight[];
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
  showInsight?: boolean;
  insightText?: string;
}

export const ChatMessage = ({
  message,
  highlights,
  onHighlightChange,
  onHighlightRemove,
  showInsight = false,
  insightText = ''
}: ChatMessageProps) => {
  // Log to debug insights
  if (showInsight) {
    console.log('ChatMessage showing insight:', { showInsight, insightText, messageId: message.id });
  }
  
  return (
    <div className={`message ${message.sender}`}>
      {/* Render message content */}
      <HighlightedText 
        text={message.text} 
        highlights={highlights} 
        onHighlightChange={onHighlightChange}
        onHighlightRemove={onHighlightRemove}
        messageId={message.id.toString()}
      />
      
      {/* Render insight card if this is the message we want to show it after */}
      {showInsight && insightText && (
        <InsightCard insight={insightText} />
      )}
    </div>
  );
};
