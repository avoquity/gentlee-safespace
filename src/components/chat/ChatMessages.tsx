
import React, { useRef, useState, useEffect } from 'react';
import { Message, Highlight } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Check if this is a first-time user
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (!user) return;

      try {
        const { data: userChats, error } = await supabase
          .from('chat')
          .select('id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking user chat history:', error);
          return;
        }

        setIsFirstTimeUser(!userChats || userChats.length <= 1);
      } catch (error) {
        console.error('Error in checkFirstTimeUser:', error);
      }
    };

    checkFirstTimeUser();
  }, [user]);

  // Find the first AI message index to show the insight after
  const findInsightTarget = () => {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].sender === 'ai') {
        return i; // Return index of first AI message
      }
    }
    return -1; // No AI messages found
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
        isFirstTimeUser={isFirstTimeUser}
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
