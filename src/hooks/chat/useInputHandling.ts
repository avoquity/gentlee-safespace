import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useInputHandling = (
  user: any,
  currentChatId: number | null,
  findTodaysChat: () => Promise<number | null>,
  createNewChat: () => Promise<number | null>,
  setCurrentChatId: (id: number | null) => void,
  getTodayFormattedDate: () => string,
  addMessage: (message: Message) => void,
  streamAIResponse: (
    userMessage: string, 
    chatId: number, 
    updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void,
    addMessageCallback: (message: Message) => void
  ) => Promise<void>,
  updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void
) => {
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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

      // Fetch user's first name from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }
      
      const userName = profileData?.first_name || '';
      
      // Store the original user input
      const originalInput = input;
      
      // Create enhanced message with user name if available
      let enhancedInput = originalInput;
      if (userName) {
        // Format the enhanced input to include the user's name, but keep the original message intact
        enhancedInput = `My name is ${userName}. ${originalInput}`;
      }
      
      // Save the original message to database (what the user actually typed)
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: originalInput, // Save the original input
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
        text: originalInput, // Display the original input to the user
        sender: 'user' as const,
        timestamp: new Date()
      };

      addMessage(newMessage);
      setInput('');
      
      // Use streaming AI response with the enhanced input
      await streamAIResponse(enhancedInput, chatId, updateMessage, addMessage);
    } catch (error: any) {
      console.error('Error submitting message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    }
  }, [input, user, currentChatId, findTodaysChat, createNewChat, setCurrentChatId, navigate, getTodayFormattedDate, addMessage, streamAIResponse, updateMessage, toast]);

  // Mute toggle handling
  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
    const audio = document.querySelector('audio');
    if (audio) {
      audio.muted = !isMuted;
    }
  }, [isMuted]);

  return {
    input,
    setInput,
    isMuted,
    handleSubmit,
    handleMuteToggle
  };
};
