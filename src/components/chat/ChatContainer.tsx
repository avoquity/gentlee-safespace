
import React, { useState, useRef } from 'react';
import { NotebookPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './input';
import { ScrollToTop } from './ScrollToTop';
import { Highlight, Message } from '@/types/chat';
import { ScrollToTopFloating } from './ScrollToTopFloating';
import { Badge } from '@/components/ui/badge';

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  highlights: Highlight[];
  displayDate?: string;
  messageCount?: number;
  weeklyLimit?: number;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  input,
  setInput,
  isTyping,
  highlights,
  displayDate,
  messageCount = 0,
  weeklyLimit = 10,
  onSubmit,
  onClose,
  onHighlightChange,
  onHighlightRemove,
  messagesEndRef
}) => {
  // Environment detection
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Create refs
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndWrapperRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="min-h-screen bg-warm-beige flex flex-col relative" ref={containerRef} style={{position: 'relative', overflow: 'auto'}}>
      {isDevelopment && (
        <div className="absolute top-2 left-2 z-50">
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
            Dev Mode
          </Badge>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 sm:px-6 relative">
          <ChatHeader 
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
          <div ref={messagesEndWrapperRef} style={{ height: 1, position: 'relative'}} aria-hidden />
        </div>
      </div>

      <ScrollToTopFloating scrollContainer={containerRef} />

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-warm-beige via-warm-beige to-transparent py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <form ref={formRef} onSubmit={onSubmit}>
            <ChatInput 
              input={input}
              setInput={setInput}
              handleSubmit={onSubmit}
              messageCount={messageCount}
              weeklyLimit={weeklyLimit}
              onJournalClick={() => {}} // This is no longer needed as ChatInput handles the journal modal
            />
          </form>
        </div>
      </div>
      
      <ScrollToTop scrollContainer={containerRef} endRef={messagesEndWrapperRef} isTyping={isTyping} />
    </div>
  );
};
