
import React, { useRef, useState, useEffect } from 'react';
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
  const [timeAtBottom, setTimeAtBottom] = useState<number | null>(null);
  const [shouldShowBanner, setShouldShowBanner] = useState(false);
  
  // Find last AI message to render check-in banner after it
  const lastAiMessageIndex = [...messages].reverse().findIndex(msg => 
    (msg.user_role === 'assistant' || msg.sender === 'ai')
  );
  const insertBannerAfter = lastAiMessageIndex !== -1 ? messages.length - 1 - lastAiMessageIndex : -1;
  
  // Check if user has sent at least 3 messages
  const userMessageCount = messages.filter(msg => 
    msg.sender === 'user' || msg.user_role === 'user'
  ).length;
  
  // Handle scroll detection
  useEffect(() => {
    if (!showCheckInBanner || checkInEnabled) return;
    
    const handleScroll = () => {
      // Check if user has scrolled to bottom
      if (messagesEndRef.current) {
        const distanceToBottom = 
          document.documentElement.scrollHeight - 
          (window.innerHeight + window.scrollY);
        
        if (distanceToBottom < 50) {
          // User is at bottom
          if (!timeAtBottom) {
            setTimeAtBottom(Date.now());
          }
        } else {
          // User scrolled away from bottom
          setTimeAtBottom(null);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showCheckInBanner, checkInEnabled, messagesEndRef, timeAtBottom]);
  
  // Handle timer for showing banner
  useEffect(() => {
    if (!showCheckInBanner || checkInEnabled || !timeAtBottom) return;
    
    // Show banner after 10 seconds of being at bottom
    const timer = setTimeout(() => {
      if (insertBannerAfter !== -1) {
        setShouldShowBanner(true);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [showCheckInBanner, checkInEnabled, timeAtBottom, insertBannerAfter]);
  
  // Force show banner if user has sent at least 3 messages
  useEffect(() => {
    if (!showCheckInBanner || checkInEnabled) return;
    
    if (userMessageCount >= 3 && insertBannerAfter !== -1) {
      setShouldShowBanner(true);
    }
  }, [showCheckInBanner, checkInEnabled, userMessageCount, insertBannerAfter]);
  
  // Reset banner state when checkInEnabled changes
  useEffect(() => {
    if (checkInEnabled) {
      setShouldShowBanner(false);
    }
  }, [checkInEnabled]);
  
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
      
      // Insert CheckInBanner after the last AI message
      if ((shouldShowBanner || checkInEnabled) && 
          showCheckInBanner && 
          index === insertBannerAfter) {
        
        // Show the banner right after an AI message
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
