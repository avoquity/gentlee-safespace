
import React, { useState, useRef } from 'react';
import { Notebook, PenTool } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { JournalModal } from './JournalModal';
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
  messagesEndRef
}) => {
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalText, setJournalText] = useState('');
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleModalSend = (text: string, isSavedAsLetter: boolean) => {
    if (!text.trim()) return;
    setInput(text);

    if (formRef.current) {
      setTimeout(() => {
        formRef.current?.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
        setIsJournalModalOpen(false);
        setJournalText('');
      }, 0);
    }
  };

  const handleModalCancel = (text: string) => {
    setInput(text);
  };

  // Render the journal button (Notebook icon, icon-only on mobile)
  const journalButton = isMobile ? (
    <button
      type="button"
      aria-label="Open journal"
      className="flex items-center justify-center rounded-full bg-white text-deep-charcoal hover:bg-soft-yellow/60 transition-colors border border-deep-charcoal min-w-[44px] min-h-[44px] mr-2"
      style={{
        boxShadow: '0 2px 8px 0 rgba(20, 20, 20, 0.03)',
        fontSize: 22,
      }}
      onClick={() => setIsJournalModalOpen(true)}
    >
      <Notebook size={24} aria-hidden="true" />
    </button>
  ) : (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Open journal"
            className="flex items-center justify-center rounded-full bg-white text-deep-charcoal hover:bg-soft-yellow/60 transition-colors border border-deep-charcoal min-w-[44px] min-h-[44px] mr-2"
            style={{
              boxShadow: '0 2px 8px 0 rgba(20, 20, 20, 0.03)',
              fontSize: 22,
            }}
            onClick={() => setIsJournalModalOpen(true)}
          >
            <Notebook size={22} aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Open journal</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col" ref={containerRef}>
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent py-6 z-[30]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <form ref={formRef} onSubmit={onSubmit}>
            <ChatInput
              input={input}
              setInput={setInput}
              handleSubmit={onSubmit}
              messageCount={messageCount}
              weeklyLimit={weeklyLimit}
              leftAction={journalButton}
            />
          </form>
        </div>
      </div>

      <JournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onSend={handleModalSend}
        onCancel={handleModalCancel}
        initialText={journalText}
      />

      <ScrollToTop
        scrollContainer={containerRef}
        isTyping={isTyping}
        lastMessageRef={messagesEndRef}
      />

      <audio
        src="/path-to-your-music.mp3"
        autoPlay
        loop
        muted={isMuted}
      />
    </div>
  );
};
