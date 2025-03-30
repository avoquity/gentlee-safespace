
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Message, Highlight } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

export const useChat = (chatId: number | null, locationState: any = {}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [displayDate, setDisplayDate] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [currentChatId, setCurrentChatId] = useState<number | null>(chatId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialMessageRef = useRef<string | null>(locationState?.initialMessage || null);

  // Add a new function to get or create the user's full name
  const getUserFullName = async (userId: string): Promise<string> => {
    // Try to get the cached name from localStorage first
    const cachedName = localStorage.getItem(`userFullName_${userId}`);
    
    if (cachedName) {
      console.log('Using cached user name');
      return cachedName;
    }
    
    console.log('Fetching user name from database');
    
    // If not in cache, fetch from the database
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User';
      
      // Cache the name for future use
      localStorage.setItem(`userFullName_${userId}`, fullName);
      
      return fullName;
    } catch (error) {
      console.error('Error fetching user full name:', error);
      return 'User'; // Default fallback
    }
  };

  // Load today's chat if it exists
  const loadTodaysChat = useCallback(async () => {
    if (!user) return;

    try {
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // Check if there's a chat for today
      const { data, error } = await supabase
        .from('chat')
        .select('id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Today's chat exists, navigate to it
        setCurrentChatId(data[0].id);
        navigate(`/chat/${data[0].id}`, { replace: true });
      } else {
        // No chat for today, create a new one
        await createNewChat();
      }
    } catch (error: any) {
      console.error('Error loading today\'s chat:', error);
      toast({
        title: "Error",
        description: "Failed to load today's chat. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // Create a new chat
  const createNewChat = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat')
        .insert([{ user_id: user.id }])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newChatId = data[0].id;
        setCurrentChatId(newChatId);
        navigate(`/chat/${newChatId}`, { replace: true });
        return newChatId;
      }
    } catch (error: any) {
      console.error('Error creating new chat:', error);
      toast({
        title: "Error",
        description: "Failed to create a new chat. Please try again.",
        variant: "destructive"
      });
    }
    
    return null;
  };

  // Process initial message if it exists
  const processInitialMessage = useCallback(async () => {
    if (initialMessageRef.current && user) {
      const message = initialMessageRef.current;
      initialMessageRef.current = null; // Clear it so we don't process it again
      
      // If we don't have a chat ID yet, create a new chat
      if (!currentChatId) {
        const newChatId = await createNewChat();
        if (newChatId) {
          // Wait a bit for the state to update
          setTimeout(() => {
            handleSubmit(message);
          }, 500);
        }
      } else {
        handleSubmit(message);
      }
    }
  }, [user, currentChatId]);

  // Load messages for the current chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatId || !user) return;
      
      try {
        // Get chat details
        const { data: chatData, error: chatError } = await supabase
          .from('chat')
          .select('created_at')
          .eq('id', currentChatId)
          .single();
          
        if (chatError) throw chatError;
        
        if (chatData) {
          // Format the date
          const date = new Date(chatData.created_at);
          setDisplayDate(formatDistanceToNow(date, { addSuffix: true }));
        }
        
        // Get messages
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', currentChatId)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setMessages(data as Message[]);
          
          // Count user messages for the current week
          countWeeklyMessages();
        }
        
        // Get highlights
        const { data: highlightsData, error: highlightsError } = await supabase
          .from('highlights')
          .select('*')
          .eq('chat_id', currentChatId)
          .order('created_at', { ascending: true });
          
        if (highlightsError) throw highlightsError;
        
        if (highlightsData) {
          setHighlights(highlightsData as Highlight[]);
        }
      } catch (error: any) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    loadMessages();
  }, [currentChatId, user, toast]);

  // Count weekly messages
  const countWeeklyMessages = async () => {
    if (!user) return;
    
    try {
      // Get the date for the start of the current week (Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Count messages for the current week
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('user_role', 'user')
        .gte('created_at', startOfWeek.toISOString());
        
      if (error) throw error;
      
      setMessageCount(count || 0);
    } catch (error: any) {
      console.error('Error counting weekly messages:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (userMessage: string) => {
    if (!userMessage.trim() || !user || !currentChatId) return;
    
    // Add user message to UI immediately
    const userMessageObj: Message = {
      id: Date.now().toString(),
      chat_id: currentChatId,
      user_id: user.id,
      content: userMessage,
      user_role: 'user',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    
    // Save user message to database
    try {
      const { error } = await supabase
        .from('messages')
        .insert([userMessageObj]);
        
      if (error) throw error;
      
      // Update message count
      setMessageCount(prev => prev + 1);
      
      // Get AI response
      await fetchAIResponse(userMessage);
    } catch (error: any) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch AI response
  const fetchAIResponse = async (userMessage: string) => {
    if (!user?.id) return;
    
    setIsTyping(true);
    
    try {
      // Get user's full name (from cache if available)
      const userFullName = await getUserFullName(user.id);
      
      // Send message to Supabase Edge Function with the user's full name
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: { 
          userMessage, 
          chatId: currentChatId, 
          userId: user.id,
          userFullName // Add the full name here
        }
      });
      
      if (error) throw error;
      
      // Create a placeholder for the AI response
      const aiMessageObj: Message = {
        id: Date.now().toString() + 1,
        chat_id: currentChatId!,
        user_id: user.id,
        content: '',
        user_role: 'assistant',
        created_at: new Date().toISOString(),
      };
      
      // Add the placeholder to the UI
      setMessages(prev => [...prev, aiMessageObj]);
      
      // Process the streaming response
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.substring(6));
                
                if (jsonData.error) {
                  throw new Error(jsonData.error);
                }
                
                if (jsonData.chunk) {
                  accumulatedResponse = jsonData.fullResponse;
                  
                  // Update the AI message with the accumulated response
                  setMessages(prev => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    
                    if (lastMessage && lastMessage.user_role === 'assistant') {
                      lastMessage.content = accumulatedResponse;
                    }
                    
                    return updated;
                  });
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }
      }
      
      // Save the complete AI response to the database
      if (accumulatedResponse) {
        const { error: saveError } = await supabase
          .from('messages')
          .insert([{
            chat_id: currentChatId,
            user_id: user.id,
            content: accumulatedResponse,
            user_role: 'assistant',
          }]);
          
        if (saveError) throw saveError;
      }
    } catch (error: any) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      
      // Remove the AI message placeholder if there was an error
      setMessages(prev => prev.filter(msg => msg.content !== ''));
    } finally {
      setIsTyping(false);
    }
  };

  // Handle closing the conversation
  const handleCloseConversation = () => {
    navigate('/');
  };

  // Handle toggling mute
  const handleMuteToggle = () => {
    setIsMuted(prev => !prev);
  };

  // Handle adding or updating a highlight
  const handleHighlightChange = async (messageId: number, text: string) => {
    if (!user || !currentChatId) return;
    
    try {
      // Check if this message is already highlighted
      const existingHighlight = highlights.find(h => h.message_id === messageId);
      
      if (existingHighlight) {
        // Update existing highlight
        const { error } = await supabase
          .from('highlights')
          .update({ text })
          .eq('id', existingHighlight.id);
          
        if (error) throw error;
        
        // Update local state
        setHighlights(prev => 
          prev.map(h => h.id === existingHighlight.id ? { ...h, text } : h)
        );
      } else {
        // Create new highlight
        const newHighlight = {
          chat_id: currentChatId,
          user_id: user.id,
          message_id: messageId,
          text,
        };
        
        const { data, error } = await supabase
          .from('highlights')
          .insert([newHighlight])
          .select();
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Add to local state
          setHighlights(prev => [...prev, data[0] as Highlight]);
        }
      }
      
      toast({
        title: "Highlight saved",
        description: "Your highlight has been saved successfully."
      });
    } catch (error: any) {
      console.error('Error saving highlight:', error);
      toast({
        title: "Error",
        description: "Failed to save highlight. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle removing a highlight
  const handleHighlightRemove = async (highlightId: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', highlightId);
          
      if (error) throw error;
      
      // Update local state
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      
      toast({
        title: "Highlight removed",
        description: "Your highlight has been removed successfully."
      });
    } catch (error: any) {
      console.error('Error removing highlight:', error);
      toast({
        title: "Error",
        description: "Failed to remove highlight. Please try again.",
        variant: "destructive"
      });
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
    messageCount,
    currentChatId,
    handleSubmit,
    handleCloseConversation,
    handleMuteToggle,
    handleHighlightChange,
    handleHighlightRemove,
    processInitialMessage,
    loadTodaysChat,
    createNewChat,
  };
};
