
import { useState, useCallback } from 'react';

export const useProcessingState = () => {
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  const [isProcessingInitial, setIsProcessingInitial] = useState(false);

  const startMessageProcessing = useCallback(() => {
    setIsProcessingMessage(true);
  }, []);

  const stopMessageProcessing = useCallback(() => {
    setIsProcessingMessage(false);
  }, []);

  const startInitialProcessing = useCallback(() => {
    setIsProcessingInitial(true);
  }, []);

  const stopInitialProcessing = useCallback(() => {
    setIsProcessingInitial(false);
  }, []);

  const isAnyProcessing = isProcessingMessage || isProcessingInitial;

  return {
    isProcessingMessage,
    isProcessingInitial,
    isAnyProcessing,
    startMessageProcessing,
    stopMessageProcessing,
    startInitialProcessing,
    stopInitialProcessing
  };
};
