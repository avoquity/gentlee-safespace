
import React, { useState } from 'react';
import { Message, Highlight } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { HighlightPopover } from './HighlightPopover';
import { HighlightedText } from './HighlightedText';
import { createHighlight, removeHighlight } from '@/utils/highlightUtils';

interface ChatMessageProps {
  message: Message;
  highlights: Highlight[];
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
}

export const ChatMessage = ({ 
  message, 
  highlights, 
  onHighlightChange, 
  onHighlightRemove 
}: ChatMessageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
      
      onHighlightChange(newHighlight);
      setIsPopoverOpen(false);
      toast({
        title: "Success",
        description: "Text has been highlighted"
      });
    } catch (error: any) {
      console.error('Error creating highlight:', error);
      toast({
        title: "Error highlighting text",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRemoveHighlight = async (highlightId: number) => {
    if (!user) return;

    try {
      await removeHighlight(highlightId);
      onHighlightRemove(highlightId);
      toast({
        title: "Success",
        description: "Highlight removed"
      });
    } catch (error: any) {
      console.error('Error removing highlight:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTextSelection = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setIsPopoverOpen(false);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setIsPopoverOpen(false);
      return;
    }

    // Get the selection range
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(range.startContainer.parentElement!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    // Set position for the popover
    const rect = range.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top - 10
    });

    setSelectedText(text);
    setSelectionRange({ start, end: start + text.length });
    setIsPopoverOpen(true);
  };

  return (
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

      {isPopoverOpen && (
        <HighlightPopover
          isOpen={isPopoverOpen}
          onOpenChange={setIsPopoverOpen}
          selectedText={selectedText}
          position={popoverPosition}
          onHighlight={handleHighlight}
        />
      )}
    </div>
  );
};
