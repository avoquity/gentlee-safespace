
import React from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ScrollToTop } from './ScrollToTop';
import { Highlight, Message } from '@/types/chat';

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  isMuted: boolean;
  highlights: Highlight[];
  displayDate?: string;
  messageCount?: number;
  weeklyLimit?: number;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onMuteToggle: () => void;
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  containerRef?: React.RefObject<HTMLDivElement>; // Add containerRef prop
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  input,
  setInput,
  isTyping,
  isMuted,
  highlights,
  displayDate,
  messageCount = 0,
  weeklyLimit = 10,
  onSubmit,
  onClose,
  onMuteToggle,
  onHighlightChange,
  onHighlightRemove,
  messagesEndRef,
  containerRef
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 sm:px-6 relative">
        <ChatHeader 
          isMuted={isMuted}
          onMuteToggle={onMuteToggle}
          onClose={onClose}
          entryDate={displayDate}
        />

        <ChatMessages 
          messages={messages}
          highlights={highlights}
          isTyping={isTyping}
          onHighlightChange={onHighlightChange}
          onHighlightRemove={onHighlightRemove}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Add z-index to ensure stacking order */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent py-6 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ChatInput 
            input={input}
            setInput={setInput}
            handleSubmit={onSubmit}
            messageCount={messageCount}
            weeklyLimit={weeklyLimit}
          />
        </div>
      </div>
      
      {/* Only render ScrollToTop on the Chat page, which we are guaranteed to be on since this is ChatContainer */}
      <ScrollToTop scrollContainer={containerRef} />
      
      <audio
        src="/path-to-your-music.mp3"
        autoPlay
        loop
        muted={isMuted}
      />
    </div>
  );
};
