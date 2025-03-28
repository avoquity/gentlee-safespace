
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Message } from '@/types/chat';
import { useStreamResponse } from './useStreamResponse';
import { useMessageDatabase } from './useMessageDatabase';

export const useMessageHandling = (userId: string | undefined) => {
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  
  // Import the other hooks
  const { 
    streamedResponse, 
    getStreamingAIResponse,
    cancelOngoingRequests
  } = useStreamResponse(userId);
  
  const {
    saveUserMessage,
    saveAIMessage
  } = useMessageDatabase(userId);

  // Streaming AI response with real-time updates
  const streamAIResponse = async (
    userMessage: string, 
    chatId: number, 
    updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void,
    addMessageCallback: (message: Message) => void
  ) => {
    setIsTyping(true);
    
    try {
      // Create a temporary AI message to show typing
      const tempMessage: Message = {
        id: 'temp-' + Date.now().toString(),
        text: '',
        sender: 'ai',
        timestamp: new Date()
      };
      addMessageCallback(tempMessage);

      // Start streaming response
      const finalResponse = await getStreamingAIResponse(
        userMessage,
        chatId,
        (chunk) => {
          // Using the updater function correctly
          updateMessage(tempMessage.id, (prev: string) => prev + chunk);
        }
      );

      // Once streaming is complete, save the message to the database
      const savedMessage = await saveAIMessage(finalResponse, chatId);
      
      if (savedMessage) {
        // Fixed: Using the correct overload of updateMessage to replace the temp message with the saved one
        // This ensures we don't see the message ID displayed in the UI
        updateMessage(tempMessage.id, savedMessage.id, savedMessage.text);
      }
    } catch (error: any) {
      console.error('Error in AI streaming response:', error);
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
    getStreamingAIResponse,
    saveUserMessage,
    saveAIMessage,
    streamAIResponse,
    cancelOngoingRequests
  };
};
