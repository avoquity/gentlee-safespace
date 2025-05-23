
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useStreamResponse = (userId: string | undefined) => {
  const [streamedResponse, setStreamedResponse] = useState('');
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function for any ongoing fetch requests
  const cancelOngoingRequests = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

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

      // Fix: Using a hardcoded URL or import.meta.env instead of process.env
      // This resolves the "process is not defined" error
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmcmrivswbszhqqragli.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/chat-completion`;
      
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

  return {
    streamedResponse,
    setStreamedResponse,
    getStreamingAIResponse,
    cancelOngoingRequests
  };
};
