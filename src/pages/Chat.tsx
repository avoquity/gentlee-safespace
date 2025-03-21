
import React, { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Weekly message limit for free users
const WEEKLY_MESSAGE_LIMIT = 10;

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const chatIdFromParams = params.chatId ? parseInt(params.chatId) : null;

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
      onSubmit={handleSubmit}
      onClose={handleCloseConversation}
      onMuteToggle={handleMuteToggle}
      onHighlightChange={handleHighlightChange}
      onHighlightRemove={handleHighlightRemove}
      messagesEndRef={messagesEndRef}
    />
  );
};

export default Chat;
