
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message, LocationState } from '@/types/chat';

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
    firstMessageLockRef: React.MutableRefObject<boolean>
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  const [todaysChatChecked, setTodaysChatChecked] = useState(false);
  const [displayDate, setDisplayDate] = useState(entryDate || '');

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

  // Process initial message function
  const processInitialMessage = useCallback(async () => {
    let messageToProcess: string | null = null;
    // let processedItemType: 'pending' | 'initial' | null = null; // Not strictly needed but good for clarity

    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      messageToProcess = pendingMessage;
      // processedItemType = 'pending';
      sessionStorage.removeItem('pendingMessage'); // Remove immediately
    } else {
      const initialMessageFromStorage = sessionStorage.getItem('initialMessage');
      if (initialMessageFromStorage) {
        messageToProcess = initialMessageFromStorage;
        // processedItemType = 'initial';
        sessionStorage.removeItem('initialMessage'); // Remove immediately
      }
    }
    
    
    if (messageToProcess && user && !initialMessageProcessed) {
      if (firstMessageLockRef.current) {
        console.log('processInitialMessage: Lock already acquired by handleSubmit. Clearing stored message and aborting.');
        // sessionStorage was already cleared when messageToProcess was populated.
        // setInitialMessageProcessed(true); // Consider if this is needed to prevent re-runs if other dependencies change.
                                         // For now, let's assume the combination of initialMessageProcessed and the lock is sufficient.
        return; // Abort if lock is held.
      }

      // Acquire the lock if we are going to process this message.
      firstMessageLockRef.current = true;
      console.log('processInitialMessage: Lock acquired.');

      setInitialMessageProcessed(true);
      
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

        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .insert([{
            chat_id: chatId,
            content: messageToProcess, // Use the variable that holds the message
            user_role: 'user',
            sender_id: user.id,
          }])
          .select()
          .single();

        if (messageError) {
          toast({
            title: "Error saving message",
            description: messageError.message,
            variant: "destructive"
          });
          return;
        }

        const firstMessage = {
          id: messageData.id.toString(),
          text: messageToProcess, // Use the variable that holds the message
          sender: 'user' as const,
          timestamp: new Date()
        };
        
        addMessage(firstMessage);
        
        // Update URL with chat ID
        navigate(`/chat/${chatId}`, { 
          state: { entryDate: getTodayFormattedDate() },
          replace: true 
        });
        
        // sessionStorage items are already removed. No need to remove them here again.
        
        // Stream AI response to the user message
        await streamAIResponse(messageToProcess, chatId, updateMessage, addMessage);
      } catch (error: any) {
        console.error('Error processing initial message:', error);
        toast({
          title: "Error",
          description: "Failed to process your message. Please try again.",
          variant: "destructive"
        });
        // Note: The lock is intentionally not released here.
        // It's expected to be reset by a dedicated mechanism after the first successful message exchange
        // or when the component unmounts/chat session ends.
      }
    }
  }, [user, initialMessageProcessed, currentChatId, findTodaysChat, createNewChat, setCurrentChatId, navigate, getTodayFormattedDate, streamAIResponse, updateMessage, addMessage, toast, firstMessageLockRef]);

  return {
    displayDate,
    loadTodaysChat,
    processInitialMessage
  };
};
