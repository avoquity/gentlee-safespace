
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LocationState } from '@/types/chat';
import { UseChatReturn } from './chat/types';
import { useChatManagement } from './chat/useChatManagement';
import { useMessageHandling } from './chat/useMessageHandling';
import { useHighlights } from './chat/useHighlights';
import { useMessages } from './chat/useMessages';
import { useInitialSetup } from './chat/useInitialSetup';
import { useInputHandling } from './chat/useInputHandling';
import { useDataFetching } from './chat/useDataFetching';

export const useChat = (
  chatIdFromUrl: number | null = null,
  locationState: LocationState | null = null
): UseChatReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // First prioritize chatId from URL, then from location state
  const { initialMessage, chatId: stateExistingChatId, entryDate } = locationState || 
    (location.state as LocationState) || {};
  
  // Store initialMessage in sessionStorage if it exists
  useEffect(() => {
    if (initialMessage) {
      sessionStorage.setItem('initialMessage', initialMessage);
    }
  }, [initialMessage]);

  // Custom hooks
  const {
    currentChatId,
    setCurrentChatId,
    findTodaysChat,
    createNewChat,
    handleCloseConversation: closeConversation,
    getTodayFormattedDate
  } = useChatManagement(user?.id);

  const { messages, setMessages, updateMessage, addMessage } = useMessages();

  const {
    isTyping,
    streamAIResponse
  } = useMessageHandling(user?.id);

  const {
    highlights,
    handleHighlightChange,
    handleHighlightRemove
  } = useHighlights(currentChatId);

  const {
    displayDate,
    loadTodaysChat,
    processInitialMessage
  } = useInitialSetup(
    user,
    chatIdFromUrl,
    stateExistingChatId,
    entryDate,
    findTodaysChat,
    createNewChat,
    setCurrentChatId,
    currentChatId,
    getTodayFormattedDate,
    updateMessage,
    addMessage,
    streamAIResponse
  );

  const {
    input,
    setInput,
    isMuted,
    handleSubmit,
    handleMuteToggle
  } = useInputHandling(
    user,
    currentChatId,
    findTodaysChat,
    createNewChat,
    setCurrentChatId,
    getTodayFormattedDate,
    addMessage,
    streamAIResponse,
    updateMessage
  );

  // Fetch data
  useDataFetching(currentChatId, setMessages);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Handle closing the conversation wrapper
  const handleCloseConversation = async () => {
    if (await closeConversation(messages, currentChatId)) {
      navigate('/entries');
    }
  };

  return {
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
    loadTodaysChat,
    updateMessage,
    addMessage
  };
};
