
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useMessageHandling = (userId: string | undefined) => {
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

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

  // Save a user message to the database
  const saveUserMessage = async (content: string, chatId: number): Promise<Message | null> => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: content,
          user_role: 'user',
          sender_id: userId,
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      return {
        id: messageData.id.toString(),
        text: content,
        sender: 'user' as const,
        timestamp: new Date()
      };
    } catch (error: any) {
      toast({
        title: "Error saving message",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Save an AI message to the database
  const saveAIMessage = async (content: string, chatId: number): Promise<Message | null> => {
    try {
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          content: content,
          user_role: 'ai',
          sender_id: null,
        }])
        .select()
        .single();

      if (messageError) throw messageError;

      return {
        id: messageData.id.toString(),
        text: content,
        sender: 'ai' as const,
        timestamp: new Date()
      };
    } catch (error: any) {
      toast({
        title: "Error saving AI response",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  // Simulate AI response
  const simulateAIResponse = async (
    userMessage: string, 
    chatId: number, 
    addMessageCallback: (message: Message) => void
  ) => {
    setIsTyping(true);
    
    try {
      const aiResponse = await getAIResponse(userMessage);
      
      const aiMessage = await saveAIMessage(aiResponse, chatId);
      
      if (aiMessage) {
        addMessageCallback(aiMessage);
      }
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

  return {
    isTyping,
    setIsTyping,
    getAIResponse,
    saveUserMessage,
    saveAIMessage,
    simulateAIResponse
  };
};
