
import React, { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Weekly message limit for free users
const WEEKLY_MESSAGE_LIMIT = 10;

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const chatIdFromParams = params.chatId ? parseInt(params.chatId) : null;
  const [hasSubscription, setHasSubscription] = React.useState(false);

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

  // Check if user has a subscription
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error checking subscription:', error);
          return;
        }
        
        // User has subscription if status is 'active' or 'trialing'
        setHasSubscription(
          data?.subscription_status === 'active' || 
          data?.subscription_status === 'trialing'
        );
      } catch (err) {
        console.error('Error:', err);
      }
    };
    
    if (!loading && user) {
      checkSubscription();
    }
  }, [user, loading]);

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

  // Handler to pass the string message to handleSubmit
  const handleMessageSubmit = (message: string) => {
    handleSubmit(message);
  };

  return (
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
      hasSubscription={hasSubscription}
      onSubmit={handleMessageSubmit}
      onClose={handleCloseConversation}
      onMuteToggle={handleMuteToggle}
      onHighlightChange={handleHighlightChange}
      onHighlightRemove={handleHighlightRemove}
      messagesEndRef={messagesEndRef}
    />
  );
};

export default Chat;
