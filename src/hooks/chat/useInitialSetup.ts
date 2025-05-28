
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Message, LocationState } from '@/types/chat';
import { useSharedMessageLogic } from './useSharedMessageLogic';

export const useInitialSetup = (
  user: any,
  chatIdFromUrl: number | null,
  stateExistingChatId: number | undefined,
  entryDate: string | undefined,
  findTodaysChat: () => Promise<number | null>,
  createNewChat: () => Promise<number | null>,
  setCurrentChatId: (id: number | null) => void,
  currentChatId: number | null,
  getTodayFormattedDate: () => string,
  updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void,
  addMessage: (message: Message) => void,
  streamAIResponse: (
    userMessage: string, 
    chatId: number, 
    updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void,
    addMessageCallback: (message: Message) => void
  ) => Promise<void>,
  isAnyProcessing: boolean,
  startInitialProcessing: () => void,
  stopInitialProcessing: () => void
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  const [todaysChatChecked, setTodaysChatChecked] = useState(false);
  const [displayDate, setDisplayDate] = useState(entryDate || '');
  const { insertUserMessage } = useSharedMessageLogic(user?.id);

  // Initialize currentChatId from URL or props if available
  useEffect(() => {
    // Priority: URL param > location state > current state
    if (chatIdFromUrl) {
      setCurrentChatId(chatIdFromUrl);
    } else if (stateExistingChatId && !currentChatId) {
      setCurrentChatId(stateExistingChatId);
    }
  }, [chatIdFromUrl, stateExistingChatId, currentChatId, setCurrentChatId]);

  // Set display date on initialization
  useEffect(() => {
    if (!displayDate) {
      setDisplayDate(getTodayFormattedDate());
    }
  }, [displayDate, getTodayFormattedDate]);

  // Function to load today's chat if it exists
  const loadTodaysChat = useCallback(async () => {
    if (chatIdFromUrl || currentChatId || todaysChatChecked || !user) {
      return;
    }

    try {
      setTodaysChatChecked(true);
      const todaysChatId = await findTodaysChat();
      
      if (todaysChatId) {
        setCurrentChatId(todaysChatId);
        
        // Update the display date
        setDisplayDate(getTodayFormattedDate());
        
        // Update the URL state to include the chat ID without changing the URL
        navigate(
          `/chat/${todaysChatId}`, 
          { 
            state: { 
              entryDate: getTodayFormattedDate()
            },
            replace: true 
          }
        );
      }
    } catch (error) {
      console.error('Error loading today\'s chat:', error);
    }
  }, [user, chatIdFromUrl, currentChatId, todaysChatChecked, navigate, findTodaysChat, setCurrentChatId, getTodayFormattedDate]);

  // Process initial message function with race condition protection
  const processInitialMessage = useCallback(async () => {
    // Wait for any ongoing processing to complete
    if (isAnyProcessing) {
      console.log('Waiting for ongoing processing to complete...');
      return;
    }

    // Check for pending message in session storage first, take priority over initialMessage
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    const initialMessage = sessionStorage.getItem('initialMessage');
    const messageToProcess = pendingMessage || initialMessage;
    
    console.log('Processing initial message:', messageToProcess);
    
    if (messageToProcess && user && !initialMessageProcessed) {
      setInitialMessageProcessed(true);
      startInitialProcessing();
      
      // Clear session storage immediately to prevent duplicate processing
      if (pendingMessage) {
        sessionStorage.removeItem('pendingMessage');
      }
      if (initialMessage) {
        sessionStorage.removeItem('initialMessage');
      }
      
      try {
        // First check if today's chat already exists or use current chat
        let chatId = currentChatId;
        
        if (!chatId) {
          const todaysChatId = await findTodaysChat();
          
          // Use existing chat or create new one
          if (todaysChatId) {
            chatId = todaysChatId;
          } else {
            chatId = await createNewChat();
          }
        }
        
        if (!chatId) return;

        setCurrentChatId(chatId);

        // Use shared message insertion logic
        const firstMessage = await insertUserMessage(messageToProcess, chatId);
        
        if (!firstMessage) return;
        
        addMessage(firstMessage);
        
        // Update URL with chat ID
        navigate(`/chat/${chatId}`, { 
          state: { entryDate: getTodayFormattedDate() },
          replace: true 
        });
        
        // Stream AI response to the user message
        await streamAIResponse(messageToProcess, chatId, updateMessage, addMessage);
      } catch (error: any) {
        console.error('Error processing initial message:', error);
        toast({
          title: "Error",
          description: "Failed to process your message. Please try again.",
          variant: "destructive"
        });
      } finally {
        stopInitialProcessing();
      }
    }
  }, [user, initialMessageProcessed, currentChatId, findTodaysChat, createNewChat, setCurrentChatId, navigate, getTodayFormattedDate, streamAIResponse, updateMessage, addMessage, toast, isAnyProcessing, startInitialProcessing, stopInitialProcessing, insertUserMessage]);

  return {
    displayDate,
    loadTodaysChat,
    processInitialMessage
  };
};
