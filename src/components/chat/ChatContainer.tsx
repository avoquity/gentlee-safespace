
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
  const [isIdleAtBottom, setIsIdleAtBottom] = useState(true); // Default to true to make banner more likely to show
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndWrapperRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is eligible to see the check-in banner
  useEffect(() => {
    const checkBannerEligibility = async () => {
      if (!user) {
        console.log("Banner eligibility check: No user logged in");
        return;
      }

      // Always check notification permission first
      console.log("Notification permission status:", Notification.permission);

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
        
        console.log("Profile data:", profile);
        console.log("Banner seen status:", profile.banner_seen);
        
        // Show the banner if it hasn't been seen before or if banner_seen is explicitly false
        if (!profile.banner_seen) {
          console.log("Setting showCheckInBanner to true");
          setShowCheckInBanner(true);
          
          // Force isIdleAtBottom to true to ensure the banner shows up
          setTimeout(() => {
            setIsIdleAtBottom(true);
          }, 2000);
        }
      } catch (error) {
        console.error("Error checking banner eligibility:", error);
      }
    };

    // Add a slight delay to ensure user data has loaded
    const timer = setTimeout(() => {
      checkBannerEligibility();
    }, 1000);
    
    return () => clearTimeout(timer);
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

      const isAtBottom = Math.abs(container.scrollHeight - container.clientHeight - container.scrollTop) < 100; // Increased threshold
      
      if (isAtBottom) {
        // Set a timer to detect idle state at bottom
        idleTimerRef.current = window.setTimeout(() => {
          console.log("User is idle at bottom, setting isIdleAtBottom to true");
          setIsIdleAtBottom(true);
        }, 1500); // Reduced idle time threshold
      } else {
        setIsIdleAtBottom(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    // Trigger the idle detection immediately
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [showCheckInBanner]);

  // Directly log the values to help with debugging
  useEffect(() => {
    console.log("Banner visibility conditions:", { showCheckInBanner, isIdleAtBottom });
    
    // For testing: Show a toast when banner conditions change
    if (showCheckInBanner && isIdleAtBottom && isDevelopment) {
      toast({
        title: "Banner conditions met",
        description: "The banner should be visible now",
      });
    }
  }, [showCheckInBanner, isIdleAtBottom, toast, isDevelopment]);

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
          .update({ 
            banner_seen: true 
          } as Partial<ProfileWithCheckIn>)
          .eq('id', user.id);
      } catch (error) {
        console.error("Error updating banner seen status:", error);
      }
    }
  };

  // Reset banner visibility for testing
  const resetBanner = async () => {
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ 
            banner_seen: false 
          } as Partial<ProfileWithCheckIn>)
          .eq('id', user.id);
          
        toast({
          title: "Banner reset",
          description: "Check-in banner has been reset and should show again."
        });
        
        setShowCheckInBanner(true);
        setIsIdleAtBottom(true);
      } catch (error) {
        console.error("Error resetting banner status:", error);
        toast({
          title: "Error",
          description: "Failed to reset check-in banner status."
        });
      }
    }
  };

  // Force banner to show for testing purposes
  const forceShowBanner = () => {
    setShowCheckInBanner(true);
    setIsIdleAtBottom(true);
  };

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col relative" ref={containerRef} style={{position: 'relative', overflow: 'auto'}}>
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
          
          {/* Debug buttons for testing - only visible in development */}
          {isDevelopment && (
            <div className="mt-4 mb-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={forceShowBanner}
                className="text-xs"
              >
                Force Show Banner
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetBanner}
                className="text-xs"
              >
                Reset Banner Status
              </Button>
            </div>
          )}
        </div>
      </div>

      <ScrollToTopFloating scrollContainer={containerRef} />

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          {/* Check-in banner - show whenever both conditions are true */}
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
