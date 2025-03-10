
import React, { useState, useRef, useEffect } from 'react';
import { Message, Highlight } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { HighlightedText } from './HighlightedText';
import { createHighlight, removeHighlight } from '@/utils/highlightUtils';
import { Highlighter } from 'lucide-react';

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
  const [showHighlightTooltip, setShowHighlightTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const messageRef = useRef<HTMLDivElement>(null);

  // Reset tooltip when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
  //       setShowHighlightTooltip(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  const handleHighlight = async () => {
    if (!user || !selectionRange) return;

    try {
      const newHighlight = await createHighlight(
        message.id,
        selectionRange.start,
        selectionRange.end,
        user.id
      );
      
      onHighlightChange(newHighlight);
      toast({
        title: "Success",
        description: "Text has been highlighted"
      });
      setShowHighlightTooltip(false);
    } catch (error: any) {
      toast({
        title: "Error highlighting text",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedContent = range.toString().trim();

    if (!selectedContent) {
      setShowHighlightTooltip(false);
      return;
    }

    // Get selection coordinates for tooltip positioning
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Calculate text offsets
    const container = messageRef.current;
    if (!container) return;

    const textContent = container.textContent || '';
    const start = textContent.indexOf(selectedContent);
    const end = start + selectedContent.length;

    setSelectedText(selectedContent);
    setSelectionRange({ start, end });
    setTooltipPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top + scrollTop - 10
    });
    setShowHighlightTooltip(true);
    console.log('Selection detected:', { selectedContent, start, end });
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        ref={messageRef}
        className={`max-w-[80%] px-6 py-4 rounded-2xl relative ${
          message.sender === 'user' ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
        onMouseUp={handleTextSelection}
      >
        <HighlightedText
          text={message.text}
          highlights={highlights}
          onRemoveHighlight={onHighlightRemove}
        />

        {showHighlightTooltip && selectionRange && (
          <div 
            className="fixed z-50 bg-white shadow-lg rounded-lg px-4 py-2 transform -translate-x-1/2 flex items-center gap-2 text-sm text-deep-charcoal hover:text-white hover:bg-soft-yellow transition-colors duration-200 cursor-pointer"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y
            }}
            onClick={handleHighlight}
          >
            <Highlighter size={16} />
            Highlight text
          </div>
        )}
      </div>
    </div>
  );
};
