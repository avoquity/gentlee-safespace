
import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to update a message text
  const updateMessage = useCallback((id: string, updater: ((prevText: string) => string) | string, newText?: string) => {
    setMessages(prevMessages => 
      prevMessages.map(message => {
        // If id matches and updater is a function, pass current text to updater
        if (message.id === id && typeof updater === 'function') {
          return { ...message, text: updater(message.text) };
        } 
        // If id matches and updater is a string (new id) and newText is provided
        else if (message.id === id && typeof updater === 'string' && newText) {
          return { ...message, id: updater, text: newText };
        }
        // If id matches and updater is a string (new text)
        else if (message.id === id && typeof updater === 'string') {
          return { ...message, text: updater };
        }
        return message;
      })
    );
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
