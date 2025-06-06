
import { useEffect, useState, useRef } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek } from 'date-fns';

export const useChat = (
  chatIdFromUrl: number | null = null,
  locationState: LocationState | null = null
): UseChatReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messageCount, setMessageCount] = useState(0);
  const firstMessageLockRef = useRef<boolean>(false);
  
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
    streamAIResponse,
    firstMessageLockRef
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
    updateMessage,
    firstMessageLockRef
  );

  // Fetch data
  useDataFetching(currentChatId, setMessages);
  
  // Load message count for the current week
  useEffect(() => {
    const fetchWeeklyMessageCount = async () => {
      if (!user) return;
      
      // Calculate the start and end of the current week (Sunday to Saturday)
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 0 }); // 0 = Sunday
      const weekEnd = endOfWeek(now, { weekStartsOn: 0 });
      
      try {
        // Count user messages for this week across all chats
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: false })
          .eq('sender_id', user.id)
          .eq('user_role', 'user')
          .gte('created_at', weekStart.toISOString())
          .lte('created_at', weekEnd.toISOString());
          
        if (error) {
          console.error("Error fetching message count:", error);
          return;
        }
        
        console.log("Weekly message count:", count);
        setMessageCount(count || 0);
      } catch (error) {
        console.error("Error in fetchWeeklyMessageCount:", error);
      }
    };
    
    fetchWeeklyMessageCount();
    
    // Update count when messages change
    if (messages.length > 0) {
      fetchWeeklyMessageCount();
    }
  }, [user, messages]);

  // Log whenever message count changes for debugging
  useEffect(() => {
    console.log(`Current message count: ${messageCount}/${WEEKLY_MESSAGE_LIMIT}`);
  }, [messageCount]);

  // Handle closing the conversation wrapper
  const handleCloseConversation = async () => {
    if (await closeConversation(messages, currentChatId)) {
      navigate('/entries');
    }
  };

  // Weekly message limit constant
  const WEEKLY_MESSAGE_LIMIT = 10;

  // Effect to reset the firstMessageLockRef
  useEffect(() => {
    // The lock is engaged by either processInitialMessage or handleSubmit
    // when handling the very first message of a potentially new chat session.
    // It should be reset once that first user message has been successfully sent
    // and the AI response process has started.
    if (firstMessageLockRef.current) {
      const firstUserMessageExists = messages.some(msg => msg.sender === 'user');

      // We reset the lock if it's currently true AND at least one user message exists in the chat.
      // This implies that the user's first message has been added to the messages array.
      // At this point, the lock has served its purpose of preventing duplicate submissions
      // of that initial message.
      if (firstUserMessageExists) {
        console.log('useChat: Resetting firstMessageLockRef. Current messages count:', messages.length);
        firstMessageLockRef.current = false;
      }
    }
    // Adding firstMessageLockRef to dependency array to be explicit, although its .current mutation doesn't trigger re-render.
    // `messages` is the primary driver for this effect to re-run.
  }, [messages, firstMessageLockRef]);

  return {
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
    loadTodaysChat,
    updateMessage,
    addMessage
  };
};
