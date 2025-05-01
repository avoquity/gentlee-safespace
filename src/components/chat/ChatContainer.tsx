import React, { useState, useRef, useEffect } from 'react';
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
import { CheckInBanner } from './CheckInBanner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfileWithCheckIn } from '@/types/databaseTypes';

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
  const [showCheckInBanner, setShowCheckInBanner] = useState(false);
  const [isIdleAtBottom, setIsIdleAtBottom] = useState(false);
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndWrapperRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const { user } = useAuth();

  // Check if user is eligible to see the check-in banner
  useEffect(() => {
    const checkBannerEligibility = async () => {
      if (!user || Notification.permission !== 'default' || messages.length === 0) {
        return;
      }

      try {
        // Check if banner has been seen before
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }
        
        // Type the profile data correctly
        const profile = profileData as ProfileWithCheckIn;
        
        // Check if the banner_seen property exists and is true
        if (profile && profile.banner_seen === true) {
          return;
        }

        // User is eligible to see the banner
        setShowCheckInBanner(true);
      } catch (error) {
        console.error("Error checking banner eligibility:", error);
      }
    };

    checkBannerEligibility();
  }, [user, messages]);

  // Track when user is idle at the bottom of the chat
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      const isAtBottom = Math.abs(container.scrollHeight - container.clientHeight - container.scrollTop) < 50;
      
      if (isAtBottom && showCheckInBanner) {
        // Set a timer to detect idle state at bottom
        idleTimerRef.current = window.setTimeout(() => {
          setIsIdleAtBottom(true);
        }, 3000); // 3 seconds of idle time
      } else {
        setIsIdleAtBottom(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [showCheckInBanner]);

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

  const handleBannerDismiss = async () => {
    setShowCheckInBanner(false);
    
    // Update user profile to mark banner as seen
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ banner_seen: true })
          .eq('id', user.id);
      } catch (error) {
        console.error("Error updating banner seen status:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col relative" ref={containerRef} style={{position: 'relative', overflow: 'auto'}}>
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
          {/* Check-in banner - only shown when eligible and idle at bottom */}
          {showCheckInBanner && isIdleAtBottom && (
            <CheckInBanner onDismiss={handleBannerDismiss} />
          )}
          
          <form ref={formRef} onSubmit={(e) => {
            onSubmit(e);
            // Hide check-in banner if user sends a message
            if (showCheckInBanner) {
              handleBannerDismiss();
            }
          }}>
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
