
import React from 'react';
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
    handleMuteToggle
  } = useChat();

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
