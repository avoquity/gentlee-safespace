
import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';

// Weekly message limit for free users
const WEEKLY_MESSAGE_LIMIT = 10;

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const chatIdFromParams = params.chatId ? parseInt(params.chatId) : null;
  const [showCheckInGreeting, setShowCheckInGreeting] = useState(false);
  const { toast } = useToast();

  const {
    messages,
    input,
    setInput,
    isTyping,
    isMuted,
    highlights,
    displayDate,
    messageCount,
    handleSubmit,
    handleCloseConversation,
    handleHighlightChange,
    handleHighlightRemove,
    handleMuteToggle,
    processInitialMessage,
    loadTodaysChat
  } = useChat(chatIdFromParams, location.state);

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
        // Show confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFC0CB', '#FFD700', '#98FB98', '#ADD8E6']
        });
        
        // Show special greeting pill
        setShowCheckInGreeting(true);
        
        // Hide greeting after 60 seconds
        setTimeout(() => {
          setShowCheckInGreeting(false);
        }, 60000);
        
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
          console.log('Service worker registered successfully');
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }
      }
    };
    
    registerServiceWorker();
  }, []);

  return (
    <div className="relative">
      {showCheckInGreeting && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-soft-amber px-6 py-3 rounded-full shadow-md">
            <p className="font-poppins text-sm text-deep-charcoal">
              Thanks for letting me check in 💛
            </p>
          </div>
        </div>
      )}
      
      <ChatContainer
        messages={messages}
        input={input}
        setInput={setInput}
        isTyping={isTyping}
        isMuted={isMuted}
        highlights={highlights}
        displayDate={displayDate}
        messageCount={messageCount}
        weeklyLimit={WEEKLY_MESSAGE_LIMIT}
        onSubmit={handleSubmit}
        onClose={handleCloseConversation}
        onMuteToggle={handleMuteToggle}
        onHighlightChange={handleHighlightChange}
        onHighlightRemove={handleHighlightRemove}
        messagesEndRef={messagesEndRef}
      />
    </div>
  );
};

export default Chat;
