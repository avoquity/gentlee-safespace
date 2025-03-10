
import React, { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatContainer } from '@/components/chat/ChatContainer';

const Chat = () => {
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
  } = useChat();

  // Effect to process initial message from redirect and check for today's chat
  useEffect(() => {
    // First try to process any initial message (from WritingInput)
    processInitialMessage();
    
    // Then check if we need to load today's existing chat
    loadTodaysChat();
  }, [processInitialMessage, loadTodaysChat]);

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
    />
  );
};

export default Chat;
