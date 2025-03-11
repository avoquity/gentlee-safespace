
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Message, LocationState } from '@/types/chat';
import { UseChatReturn } from './chat/types';
import { useChatManagement } from './chat/useChatManagement';
import { useMessageHandling } from './chat/useMessageHandling';
import { useHighlights } from './chat/useHighlights';
import { supabase } from '@/integrations/supabase/client';

export const useChat = (
  chatIdFromUrl: number | null = null,
  locationState: LocationState | null = null
): UseChatReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // First prioritize chatId from URL, then from location state
  const { initialMessage, chatId: stateExistingChatId, entryDate } = locationState || 
    (location.state as LocationState) || {};
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [displayDate, setDisplayDate] = useState(entryDate || '');
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  const [todaysChatChecked, setTodaysChatChecked] = useState(false);

  // Custom hooks
  const {
    currentChatId,
    setCurrentChatId,
    findTodaysChat,
    createNewChat,
    handleCloseConversation: closeConversation,
    getTodayFormattedDate
  } = useChatManagement(user?.id);

  const {
    isTyping,
    simulateAIResponse
  } = useMessageHandling(user?.id);

  const {
    highlights,
    handleHighlightChange,
    handleHighlightRemove
  } = useHighlights(currentChatId);

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

  // Query for chat data
  const { data: chatData } = useQuery({
    queryKey: ['chat', currentChatId],
    queryFn: async () => {
      if (!currentChatId) return null;
      
      const { data, error } = await supabase
        .from('chat')
        .select('*')
        .eq('id', currentChatId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentChatId
  });

  // Query for chat messages
  const { data: chatMessages } = useQuery({
    queryKey: ['messages', currentChatId],
    queryFn: async () => {
      if (!currentChatId) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select('id, content, user_role, created_at')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: "Error loading messages",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return data.map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        sender: msg.user_role as 'user' | 'ai',
        timestamp: new Date(msg.created_at)
      }));
    },
    enabled: !!currentChatId
  });

  // Update messages when chat messages data changes
  useEffect(() => {
    if (chatMessages) {
      setMessages(chatMessages);
    }
  }, [chatMessages]);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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

  // Process initial message function, memoized with useCallback
  const processInitialMessage = useCallback(async () => {
    // Check for pending message in session storage first, take priority over initialMessage
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    const messageToProcess = pendingMessage || initialMessage;
    
    if (messageToProcess && user && !initialMessageProcessed) {
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
            content: messageToProcess,
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
          text: messageToProcess,
          sender: 'user' as const,
          timestamp: new Date()
        };
        
        setMessages([firstMessage]);
        
        // Update URL with chat ID
        navigate(`/chat/${chatId}`, { 
          state: { entryDate: getTodayFormattedDate() },
          replace: true 
        });
        
        // Only remove pendingMessage after successfully processing it
        if (pendingMessage) {
          sessionStorage.removeItem('pendingMessage');
        }
        
        await simulateAIResponse(messageToProcess, chatId, (aiMessage) => {
          setMessages(prev => [...prev, aiMessage]);
        });
      } catch (error: any) {
        console.error('Error processing initial message:', error);
        toast({
          title: "Error",
          description: "Failed to process your message. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [initialMessage, user, initialMessageProcessed, currentChatId, findTodaysChat, createNewChat, setCurrentChatId, navigate, getTodayFormattedDate, simulateAIResponse, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    try {
      // First check if today's chat already exists
      let chatId = currentChatId;
      
      // If no current chat ID, check for today's chat
      if (!chatId) {
        const todaysChatId = await findTodaysChat();
        
        if (todaysChatId) {
          chatId = todaysChatId;
        } else {
          // If no chat for today, create a new one
          chatId = await createNewChat();
        }
        
        if (!chatId) return;
        setCurrentChatId(chatId);
        
        // Update URL with new chat ID
        navigate(`/chat/${chatId}`, { 
          state: { entryDate: getTodayFormattedDate() },
          replace: true 
        });
      }

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: input,
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

      const newMessage = {
        id: messageData.id.toString(),
        text: input,
        sender: 'user' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newMessage]);
      setInput('');
      await simulateAIResponse(input, chatId, (aiMessage) => {
        setMessages(prev => [...prev, aiMessage]);
      });
    } catch (error: any) {
      console.error('Error submitting message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle closing the conversation wrapper
  const handleCloseConversation = async () => {
    if (await closeConversation(messages, currentChatId)) {
      navigate('/entries');
    }
  };

  // Mute toggle handling
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    const audio = document.querySelector('audio');
    if (audio) {
      audio.muted = !isMuted;
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
    loadTodaysChat
  };
};
