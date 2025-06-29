
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
  updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void,
  firstMessageLockRef: React.MutableRefObject<boolean>
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
        // It's a new chat, handleSubmit is taking control for this first message.
        firstMessageLockRef.current = true;
        console.log('handleSubmit: Lock acquired for new chat.');

        // Clear any messages that might have been intended for processInitialMessage
        sessionStorage.removeItem('initialMessage');
        sessionStorage.removeItem('pendingMessage');
        console.log('handleSubmit: Cleared session stored initial/pending messages.');

        const todaysChatId = await findTodaysChat();
        if (todaysChatId) {
          chatId = todaysChatId;
        } else {
          // If no chat for today, create a new one
          chatId = await createNewChat();
        }
        
        if (!chatId) {
          // Potentially release lock if chat creation failed and we are aborting.
          // However, the current design is to have a separate lock reset mechanism.
          // For now, if createNewChat() fails, lock might remain true until reset.
          return;
        }
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

      addMessage(newMessage);
      setInput('');
      
      // Use streaming AI response
      await streamAIResponse(input, chatId, updateMessage, addMessage);
    } catch (error: any) {
      console.error('Error submitting message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
      // If lock was acquired but an error occurred, it might remain set.
      // This will be handled by the lock reset mechanism.
    }
  }, [input, user, currentChatId, findTodaysChat, createNewChat, setCurrentChatId, navigate, getTodayFormattedDate, addMessage, streamAIResponse, updateMessage, toast, firstMessageLockRef]);

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
