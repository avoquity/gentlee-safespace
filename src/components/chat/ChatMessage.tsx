
import React, { useEffect, useState } from 'react';
import { Message, Highlight } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { HighlightPopover } from './HighlightPopover';
import { HighlightedText } from './HighlightedText';
import { fetchMessageHighlights, createHighlight, removeHighlight } from '@/utils/highlightUtils';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const loadHighlights = async () => {
      try {
        if (!message?.id || !user) return;
        const data = await fetchMessageHighlights(message.id);
        setHighlights(data);
      } catch (err: any) {
        console.error('Error loading highlights:', err);
        if (err.code === 'PGRST116') {
          toast({
            title: "Authentication required",
            description: "Please sign in to view highlights",
            variant: "destructive"
          });
        }
      }
    };

    if (user && message?.id) {
      loadHighlights();
    }
  }, [message?.id, user, toast]);

  const handleHighlight = async () => {
    if (!user || !selectionRange || !message?.id) {
      toast({
        title: "Error",
        description: !user ? "Please sign in to highlight text" : "Invalid selection or message",
        variant: "destructive"
      });
      return;
    }

    try {
      const newHighlight = await createHighlight(
        message.id,
        selectionRange.start,
        selectionRange.end,
        user.id
      );
      
      setHighlights(prev => [...prev, newHighlight]);
      setIsPopoverOpen(false);
      toast({
        title: "Text highlighted",
        description: "The selected text has been highlighted successfully."
      });
    } catch (error: any) {
      console.error('Error saving highlight:', error);
      toast({
        title: "Error highlighting text",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveHighlight = async (highlightId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to remove highlights",
        variant: "destructive"
      });
      return;
    }

    try {
      await removeHighlight(highlightId);
      setHighlights(prev => prev.filter(h => h.id !== highlightId));
      toast({
        title: "Highlight removed",
        description: "The highlight has been removed successfully."
      });
    } catch (error: any) {
      console.error('Error removing highlight:', error);
      toast({
        title: "Error removing highlight",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsPopoverOpen(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();

    if (!text) {
      setIsPopoverOpen(false);
      return;
    }

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(range.startContainer.parentElement!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    setSelectedText(text);
    setSelectionRange({ start, end: start + text.length });

    const rect = range.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top - 10
    });
    setIsPopoverOpen(true);
  };

  return (
    <>
      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[80%] px-6 py-4 rounded-2xl ${
            message.sender === 'user' ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
          onMouseUp={handleTextSelection}
        >
          <HighlightedText
            text={message.text}
            highlights={highlights}
            onRemoveHighlight={handleRemoveHighlight}
          />
        </div>
      </div>

      {isPopoverOpen && selectedText && (
        <HighlightPopover
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          selectedText={selectedText}
          position={popoverPosition}
          onHighlight={handleHighlight}
        />
      )}
    </>
  );
};
