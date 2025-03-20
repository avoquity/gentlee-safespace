
import React, { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { useParams, useLocation } from 'react-router-dom';

// Weekly message limit for free users
const WEEKLY_MESSAGE_LIMIT = 10;

const Chat = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // Add container ref for scroll to top
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
    messageCount,
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
    <div ref={containerRef} className="min-h-screen bg-soft-ivory flex flex-col overflow-auto">
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
        containerRef={containerRef} // Pass container ref to ChatContainer
      />
    </div>
  );
};

export default Chat;
