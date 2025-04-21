import React, { useState, useRef } from 'react';
import { NotebookPen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { JournalModal } from './JournalModal';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ScrollToTop } from './ScrollToTop';
import { Highlight, Message } from '@/types/chat';
import { ScrollToTopFloating } from './ScrollToTopFloating';

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
  const messagesEndWrapperRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col relative" ref={containerRef} style={{position: 'relative'}}>
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
          <div ref={messagesEndWrapperRef} style={{ height: 1, position: 'relative'}} aria-hidden />
        </div>
      </div>

      <ScrollToTopFloating scrollContainer={containerRef} />

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <form ref={formRef} onSubmit={onSubmit}>
            <ChatInput 
              input={input}
              setInput={setInput}
              handleSubmit={onSubmit}
              messageCount={messageCount}
              weeklyLimit={weeklyLimit}
              onJournalClick={() => setIsJournalModalOpen(true)}
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
      
      <ScrollToTop scrollContainer={containerRef} endRef={messagesEndWrapperRef} isTyping={isTyping} />
      
      <audio
        src="/path-to-your-music.mp3"
        autoPlay
        loop
        muted={isMuted}
      />
    </div>
  );
};
