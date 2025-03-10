
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchChatHighlights } from '@/utils/highlightUtils';
import { Highlight } from '@/types/chat';

export const useHighlights = (currentChatId: number | null) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const { toast } = useToast();

  // Load highlights for current chat
  useEffect(() => {
    const loadHighlights = async () => {
      if (!currentChatId) return;
      
      try {
        const chatHighlights = await fetchChatHighlights(currentChatId);
        setHighlights(chatHighlights);
      } catch (error: any) {
        toast({
          title: "Error loading highlights",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    if (currentChatId) {
      loadHighlights();
    }
  }, [currentChatId, toast]);

  // Highlight handling
  const handleHighlightChange = (newHighlight: Highlight) => {
    setHighlights(prev => [...prev, newHighlight]);
  };

  const handleHighlightRemove = (highlightId: number) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId));
  };

  return {
    highlights,
    handleHighlightChange,
    handleHighlightRemove
  };
};
