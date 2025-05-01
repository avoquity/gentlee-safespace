
import React, { useRef } from 'react';
import { Message, Highlight } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { CheckInBanner } from './CheckInBanner';

interface ChatMessagesProps {
  messages: Message[];
  highlights: Highlight[];
  isTyping: boolean;
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  showCheckInBanner?: boolean;
  checkInEnabled?: boolean;
  onCheckInToggle?: (enabled: boolean) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  highlights, 
  isTyping, 
  onHighlightChange, 
  onHighlightRemove,
  messagesEndRef,
  showCheckInBanner = false,
  checkInEnabled = false,
  onCheckInToggle = () => {}
}: ChatMessagesProps) => {
  // Find last AI message to render check-in banner after it
  const lastAiMessageIndex = [...messages].reverse().findIndex(msg => msg.user_role === 'assistant');
  const insertBannerAfter = lastAiMessageIndex !== -1 ? messages.length - 1 - lastAiMessageIndex : -1;

  return (
    <div className="chat-messages-container space-y-8">
      {messages.map((message, index) => (
        <React.Fragment key={message.id}>
          <ChatMessage
            message={message}
            highlights={highlights.filter(h => h.message_id.toString() === message.id)}
            onHighlightChange={onHighlightChange}
            onHighlightRemove={onHighlightRemove}
          />
          
          {/* Insert CheckInBanner after the last AI message */}
          {showCheckInBanner && index === insertBannerAfter && (
            <div className="my-6">
              <CheckInBanner 
                onToggle={onCheckInToggle}
                initialEnabled={checkInEnabled}
              />
            </div>
          )}
        </React.Fragment>
      ))}
      {isTyping && <ChatTypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};
