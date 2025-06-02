
import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to update a message text
  const updateMessage = useCallback((idToFind: string, newIdOrUpdater: ((prevText: string) => string) | string, newTextContent?: string) => {
    setMessages(prevMessages => {
      let messageWasFoundAndUpdatedInPlace = false;
      const updatedMessages = prevMessages.map(message => {
        if (message.id === idToFind) {
          messageWasFoundAndUpdatedInPlace = true;
          if (typeof newIdOrUpdater === 'function') { // Streaming update
            return { ...message, text: newIdOrUpdater(message.text) };
          } else if (typeof newIdOrUpdater === 'string' && newTextContent !== undefined) { // Final update with ID change
            return { ...message, id: newIdOrUpdater, text: newTextContent };
          } else if (typeof newIdOrUpdater === 'string') { // Text-only update (current streamAIResponse doesn't use this path for final, but good to keep)
            return { ...message, text: newIdOrUpdater };
          }
        }
        return message;
      });

      // Fallback: If it was a final update for a temp message that wasn't found
      if (!messageWasFoundAndUpdatedInPlace &&
          typeof newIdOrUpdater === 'string' &&
          newTextContent !== undefined &&
          idToFind.startsWith('temp-')) {

        console.warn(`Optimistic UI: Temp message ${idToFind} not found for final update. Adding new message ${newIdOrUpdater} directly.`);
        // Add the new (finalized) message to the array
        return [
          ...updatedMessages, // these are effectively prevMessages if no in-place update happened to other messages
          {
            id: newIdOrUpdater, // This is the final DB ID
            text: newTextContent,
            sender: 'ai', // Assuming this fallback is for AI messages from streamAIResponse
            timestamp: new Date() // Ideally, use timestamp from savedMessage if available
          }
        ];
      }

      return updatedMessages;
    });
  }, []);

  // Add a message to the messages array
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    messages,
    setMessages,
    updateMessage,
    addMessage
  };
};
