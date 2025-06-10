
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';
import { CheckInModal } from '@/components/chat/CheckInModal';
import { useCheckInModal } from '@/hooks/useCheckInModal';
import { useInsights } from '@/hooks/chat/useInsights';
import { GuidedFirstConversation } from '@/components/chat/GuidedFirstConversation';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useOnboardingState } from '@/hooks/useOnboardingState';

// Weekly message limit for free users
const WEEKLY_MESSAGE_LIMIT = 10;

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const chatIdFromParams = params.chatId ? parseInt(params.chatId) : null;
  const { toast } = useToast();

  // Feature flags and onboarding
  const { guidedConversation } = useFeatureFlags();
  const { isFirstTimeUser, firstChatCompleted, markFirstChatCompleted, markOnboardingCompleted } = useOnboardingState();

  const {
    messages,
    input,
    setInput,
    isTyping,
    highlights,
    displayDate,
    messageCount,
    handleSubmit,
    handleCloseConversation,
    handleHighlightChange,
    handleHighlightRemove,
    processInitialMessage,
    loadTodaysChat
  } = useChat(chatIdFromParams, location.state);
  
  // Check-in modal integration
  const {
    isOpen: isCheckInOpen,
    currentStep,
    handleMoodSubmit,
    handleOptIn,
    handleDismiss,
    handleComplete
  } = useCheckInModal(user?.id, messages.length);
  
  // Insights feature integration - pass messages for context
  const { shouldShowInsight, selectedInsight } = useInsights(user?.id, messageCount, messages);

  // Guided conversation state
  const [showGuidedConversation, setShowGuidedConversation] = useState(false);

  // Determine if we should show guided conversation
  useEffect(() => {
    if (guidedConversation && isFirstTimeUser && !firstChatCompleted && messages.length === 0 && !chatIdFromParams) {
      setShowGuidedConversation(true);
    } else {
      setShowGuidedConversation(false);
    }
  }, [guidedConversation, isFirstTimeUser, firstChatCompleted, messages.length, chatIdFromParams]);

  // Mark first chat as completed when user sends their first message
  useEffect(() => {
    if (messages.length > 0 && !firstChatCompleted) {
      markFirstChatCompleted();
      setShowGuidedConversation(false);
    }
  }, [messages.length, firstChatCompleted, markFirstChatCompleted]);

  const handleGuidedStarterClick = (text: string) => {
    setInput(text);
    setShowGuidedConversation(false);
    markOnboardingCompleted();
    
    // Auto-submit the guided starter
    setTimeout(() => {
      const formEvent = new Event('submit', { cancelable: true, bubbles: true }) as unknown as React.FormEvent;
      handleSubmit(formEvent);
    }, 100);
  };

  const handleSkipGuide = () => {
    setShowGuidedConversation(false);
    markOnboardingCompleted();
  };

  // Redirect to /auth if user is not logged in, but only after loading is complete
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Effect to process initial message from redirect and check for today's chat
  useEffect(() => {
    if (!loading && user) {
      if (!chatIdFromParams) {
        loadTodaysChat();
      }
      processInitialMessage();
    }
  }, [processInitialMessage, loadTodaysChat, chatIdFromParams, user, loading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Check if navigation is from a notification click
  useEffect(() => {
    // Check if user came from notification
    const checkNotificationClick = () => {
      if (!location.state) return;
      
      if (location.state.fromNotification) {
        console.log("User came from notification click");
        
        // Show confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFC0CB', '#FFD700', '#98FB98', '#ADD8E6']
        });
        
        // Show brief toast
        toast({
          title: "Check-in",
          description: "Thanks for checking in today.",
        });
        
        // Log analytics event
        try {
          fetch('https://zmcmrivswbszhqqragli.supabase.co/functions/v1/log-analytics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: user?.id,
              event_type: 'push_clicked',
              event_data: { timestamp: new Date().toISOString() }
            }),
          });
        } catch (error) {
          console.error("Failed to log analytics event:", error);
        }
      } else {
        console.log("Regular navigation, not from notification");
      }
    };
    
    checkNotificationClick();
  }, [location.state, user?.id, toast]);

  useEffect(() => {
    // Register service worker for push notifications
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service worker registered successfully in Chat.tsx');
        } catch (error) {
          console.error('Service worker registration failed in Chat.tsx:', error);
        }
      }
    };
    
    registerServiceWorker();
    
    // Log to help with debugging
    console.log("Chat rendered with:", { 
      user: user?.id, 
      chatId: chatIdFromParams,
      messagesCount: messages.length,
      isTyping
    });
  }, []);

  return (
    <div className="relative bg-warm-beige">
      {showGuidedConversation && (
        <div className="fixed inset-0 bg-warm-beige z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <GuidedFirstConversation
              onStarterClick={handleGuidedStarterClick}
              onSkip={handleSkipGuide}
              isVisible={showGuidedConversation}
            />
          </div>
        </div>
      )}

      <ChatContainer
        messages={messages}
        input={input}
        setInput={setInput}
        isTyping={isTyping}
        highlights={highlights}
        displayDate={displayDate}
        messageCount={messageCount}
        weeklyLimit={WEEKLY_MESSAGE_LIMIT}
        onSubmit={handleSubmit}
        onClose={handleCloseConversation}
        onHighlightChange={handleHighlightChange}
        onHighlightRemove={handleHighlightRemove}
        messagesEndRef={messagesEndRef}
        shouldShowInsight={shouldShowInsight}
        insightText={selectedInsight}
      />

      <CheckInModal
        isOpen={isCheckInOpen}
        currentStep={currentStep}
        onMoodSubmit={handleMoodSubmit}
        onOptIn={handleOptIn}
        onDismiss={handleDismiss}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default Chat;
