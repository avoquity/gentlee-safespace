
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
  const lastAiMessageIndex = [...messages].reverse().findIndex(msg => 
    (msg.user_role === 'assistant' || msg.sender === 'ai')
  );
  const insertBannerAfter = lastAiMessageIndex !== -1 ? messages.length - 1 - lastAiMessageIndex : -1;
  
  // Groups messages into sequence blocks
  const renderMessages = () => {
    const result: JSX.Element[] = [];
    
    messages.forEach((message, index) => {
      // Add the message
      result.push(
        <ChatMessage
          key={`msg-${message.id}`}
          message={message}
          highlights={highlights.filter(h => h.message_id.toString() === message.id)}
          onHighlightChange={onHighlightChange}
          onHighlightRemove={onHighlightRemove}
        />
      );
      
      // Insert CheckInBanner after the last AI message but only if the next message is from a user or it's the last message
      if (showCheckInBanner && checkInEnabled && index === insertBannerAfter) {
        const isLastMessage = index === messages.length - 1;
        const nextMessageIsFromUser = !isLastMessage && 
          (messages[index + 1].sender === 'user' || messages[index + 1].user_role === 'user');
        
        // Always show the banner regardless of what comes next, it should appear right after an AI message
        result.push(
          <div key="check-in-banner" className="my-6">
            <CheckInBanner 
              onToggle={onCheckInToggle}
              initialEnabled={checkInEnabled}
            />
          </div>
        );
      }
    });
    
    return result;
  };

  return (
    <div className="chat-messages-container space-y-8">
      {renderMessages()}
      {isTyping && <ChatTypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};
