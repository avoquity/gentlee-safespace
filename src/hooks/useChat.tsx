import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, startOfDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Message, LocationState, Highlight } from '@/types/chat';
import { identifyThemes } from '@/utils/themeUtils';
import { fetchChatHighlights } from '@/utils/highlightUtils';

export const useChat = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { initialMessage, chatId: existingChatId, entryDate } = (location.state as LocationState) || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(existingChatId || null);
  const [isMuted, setIsMuted] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [displayDate, setDisplayDate] = useState(entryDate || format(new Date(), 'd MMMM yyyy'));
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  const [todaysChatChecked, setTodaysChatChecked] = useState(false);

  // Query for current chat data
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

  // Load highlights for current chat
  useEffect(() => {
    const loadHighlights = async () => {
      if (!currentChatId) return;
      
      try {
        const chatHighlights = await fetchChatHighlights(currentChatId);
        setHighlights(chatHighlights);
      } catch (error: any) {
        toast({
          title: "Error loading highlights",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    if (currentChatId) {
      loadHighlights();
    }
  }, [currentChatId, toast]);

  // Function to find today's chat
  const findTodaysChat = async () => {
    if (!user) return null;
    
    try {
      const today = startOfDay(new Date());
      
      const { data: existingChats, error } = await supabase
        .from('chat')
        .select('id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error checking for existing chat:', error);
        return null;
      }
      
      if (existingChats && existingChats.length > 0) {
        return existingChats[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding today\'s chat:', error);
      return null;
    }
  };

  // Function to load today's chat if it exists
  const loadTodaysChat = useCallback(async () => {
    if (existingChatId || currentChatId || todaysChatChecked || !user) {
      return;
    }

    try {
      setTodaysChatChecked(true);
      const todaysChatId = await findTodaysChat();
      
      if (todaysChatId) {
        setCurrentChatId(todaysChatId);
        
        // Update the display date
        setDisplayDate(format(new Date(), 'd MMMM yyyy'));
        
        // Update the URL state to include the chat ID without changing the URL
        navigate(
          '/chat', 
          { 
            state: { 
              chatId: todaysChatId,
              entryDate: format(new Date(), 'd MMMM yyyy')
            },
            replace: true 
          }
        );
      }
    } catch (error) {
      console.error('Error loading today\'s chat:', error);
    }
  }, [user, existingChatId, currentChatId, todaysChatChecked, navigate]);

  // Process initial message function, memoized with useCallback
  const processInitialMessage = useCallback(async () => {
    // Check for pending message in session storage first, take priority over initialMessage from location state
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    const messageToProcess = pendingMessage || initialMessage;
    
    if (messageToProcess && user && !initialMessageProcessed) {
      setInitialMessageProcessed(true);
      
      try {
        // First check if today's chat already exists
        const todaysChatId = await findTodaysChat();
        
        // Use existing chat or create new one
        let chatId;
        if (todaysChatId) {
          chatId = todaysChatId;
        } else {
          chatId = await createNewChat();
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
        
        // Only remove pendingMessage after successfully processing it
        if (pendingMessage) {
          sessionStorage.removeItem('pendingMessage');
        }
        
        await simulateAIResponse(messageToProcess, chatId);
      } catch (error: any) {
        console.error('Error processing initial message:', error);
        toast({
          title: "Error",
          description: "Failed to process your message. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [initialMessage, user, initialMessageProcessed]);

  // Create a new chat
  const createNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chat')
        .insert([{ 
          last_updated: new Date().toISOString(),
          theme: null,
          summary: null,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      toast({
        title: "Error creating chat",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Save message to database
  const saveMessage = async (message: Message, chatId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: message.text,
          user_role: message.sender,
          sender_id: user?.id || null,
        }]);

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Handle closing the conversation
  const handleCloseConversation = async () => {
    if (messages.length > 0 && currentChatId) {
      const themes = identifyThemes(messages);
      
      try {
        const { data: chatData, error: chatError } = await supabase
          .from('chat')
          .select('summary')
          .eq('id', currentChatId)
          .single();

        if (chatError) throw chatError;

        let summary = chatData.summary;

        if (!summary) {
          const { data: summaryData, error: summaryError } = await supabase.functions.invoke('summarize-chat', {
            body: { messages }
          });

          if (summaryError) throw summaryError;
          summary = summaryData.summary;
        }

        // Update theme and summary before navigating away
        await supabase
          .from('chat')
          .update({ 
            theme: themes.join(', '),
            summary: summary,
            last_updated: new Date().toISOString()
          })
          .eq('id', currentChatId);
      } catch (error: any) {
        toast({
          title: "Error saving chat",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    navigate('/entries');
  };

  // Get AI response
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { userMessage }
      });

      if (error) throw error;
      return data.response;
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error getting AI response",
        description: error.message,
        variant: "destructive"
      });
      return "I apologize, but I'm having trouble responding right now. Could you please try again?";
    }
  };

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
      await simulateAIResponse(input, chatId);
    } catch (error: any) {
      console.error('Error submitting message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Simulate AI response
  const simulateAIResponse = async (userMessage: string, chatId: number) => {
    setIsTyping(true);
    
    try {
      const aiResponse = await getAIResponse(userMessage);
      
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: aiResponse,
          user_role: 'ai',
          sender_id: null,
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      const aiMessage = {
        id: messageData.id.toString(),
        text: aiResponse,
        sender: 'ai' as const,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error in AI response:', error);
      toast({
        title: "Error saving AI response",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Highlight handling
  const handleHighlightChange = (newHighlight: Highlight) => {
    setHighlights(prev => [...prev, newHighlight]);
  };

  const handleHighlightRemove = (highlightId: number) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
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
