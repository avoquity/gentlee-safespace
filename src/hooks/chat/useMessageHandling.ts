
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useMessageHandling = (userId: string | undefined) => {
  const [isTyping, setIsTyping] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for any ongoing fetch requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Get AI response with streaming
  const getStreamingAIResponse = async (
    userMessage: string,
    chatId: number,
    onChunkReceived: (chunk: string) => void
  ): Promise<string> => {
    try {
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      // Fix: Using the complete absolute URL instead of supabase.functions.url property
      const functionUrl = `${process.env.SUPABASE_URL || 'https://zmcmrivswbszhqqragli.supabase.co'}/functions/v1/chat-completion`;
      
      const sessionResponse = await supabase.auth.getSession();
      const accessToken = sessionResponse.data.session?.access_token;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          userMessage,
          chatId,
          userId
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert the chunk to text
        const chunkText = decoder.decode(value, { stream: true });
        
        // Process SSE format
        const lines = chunkText.split('\n\n');
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          try {
            const eventData = JSON.parse(line.substring(6));
            
            if (eventData.error) {
              throw new Error(eventData.error);
            }
            
            if (eventData.chunk) {
              onChunkReceived(eventData.chunk);
              fullResponse = eventData.fullResponse;
              setStreamedResponse(fullResponse);
            }
          } catch (e) {
            console.error('Error parsing streaming data:', e);
          }
        }
      }

      return fullResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
        return streamedResponse || "I apologize, but our conversation was interrupted. What were you saying?";
      }
      
      console.error('Error getting streaming AI response:', error);
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

  // Streaming AI response with real-time updates
  const streamAIResponse = async (
    userMessage: string, 
    chatId: number, 
    updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void,
    addMessageCallback: (message: Message) => void
  ) => {
    setIsTyping(true);
    setStreamedResponse('');
    
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
    streamAIResponse
  };
};
