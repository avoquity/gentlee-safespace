
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';
import { useSharedMessageLogic } from './useSharedMessageLogic';

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
  isAnyProcessing: boolean,
  startMessageProcessing: () => void,
  stopMessageProcessing: () => void
) => {
  const [input, setInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { insertUserMessage } = useSharedMessageLogic(user?.id);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || isAnyProcessing) return;

    startMessageProcessing();
    
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

      // Use shared message insertion logic
      const newMessage = await insertUserMessage(input, chatId);
      
      if (!newMessage) return;

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
    } finally {
      stopMessageProcessing();
    }
  }, [input, user, currentChatId, findTodaysChat, createNewChat, setCurrentChatId, navigate, getTodayFormattedDate, addMessage, streamAIResponse, updateMessage, toast, isAnyProcessing, startMessageProcessing, stopMessageProcessing, insertUserMessage]);

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
