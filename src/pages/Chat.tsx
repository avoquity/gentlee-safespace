
import React, { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useParams, useLocation } from 'react-router-dom';

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const location = useLocation();
  const chatIdFromParams = params.chatId ? parseInt(params.chatId) : null;
  
  const {
    messages,
    input,
    setInput,
    isTyping,
    isMuted,
    highlights,
    displayDate,
    handleSubmit,
    handleCloseConversation,
    handleHighlightChange,
    handleHighlightRemove,
    handleMuteToggle,
    processInitialMessage,
    loadTodaysChat
  } = useChat(chatIdFromParams, location.state);

  // Effect to process initial message from redirect and check for today's chat
  useEffect(() => {    
    // First try to check if we need to load today's existing chat
    if (!chatIdFromParams) {
      loadTodaysChat();
    }
    // Then process any initial message (from WritingInput)
    processInitialMessage();
  }, [processInitialMessage, loadTodaysChat, chatIdFromParams]);

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
