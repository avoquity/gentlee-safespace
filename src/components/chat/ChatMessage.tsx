
import React, { useState } from 'react';
import { Message, Highlight } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { HighlightedText } from './HighlightedText';
import { createHighlight, removeHighlight } from '@/utils/highlightUtils';
import ReactMarkdown from 'react-markdown';

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

  const handleHighlight = async (range: { start: number; end: number }) => {
    console.log(range);
    console.log(user);
    if (!user || !range) return;

    try {
      const newHighlight = await createHighlight(
        message.id,
        range.start,
        range.end,
        user.id
      );
      
      onHighlightChange(newHighlight);
      toast({
        title: "Success",
        description: "Text has been highlighted"
      });
      setShowHighlightTooltip(false);
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

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const text = selection.toString().trim();
    if (!text) {
      setShowHighlightTooltip(false);
      return;
    }

    // Get the selection range
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(range.startContainer.parentElement!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + text.length;

    // Set the selected text and range
    setSelectedText(text);
    setSelectionRange({ start, end });
    
    // Get accurate position for the tooltip
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    setTooltipPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top + scrollTop // Add scroll position for accurate placement
    });
    setShowHighlightTooltip(true);
  };

  const renderMarkdownContent = (content: string) => {
    return (
      <div className="text-deep-charcoal text-lg leading-relaxed">
        <ReactMarkdown
          components={{
            p: ({ children }) => {
              const textContent = React.Children.toArray(children)
                .map(child => (typeof child === 'string' ? child : ''))
                .join('');
              
              return (
                <HighlightedText
                  text={textContent}
                  highlights={highlights}
                  onRemoveHighlight={handleRemoveHighlight}
                />
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-6 py-4 rounded-2xl relative ${
          message.sender === 'user' ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
        onMouseUp={handleTextSelection}
        onMouseDown={() => setShowHighlightTooltip(false)}
      >
        {message.sender === 'ai' ? renderMarkdownContent(message.text) : (
          <HighlightedText
            text={message.text}
            highlights={highlights}
            onRemoveHighlight={handleRemoveHighlight}
          />
        )}

        {showHighlightTooltip && selectionRange && (
          <div 
            className="fixed z-50 bg-white shadow-lg rounded-lg px-4 py-2 transform -translate-x-1/2 text-sm text-deep-charcoal hover:text-white hover:bg-soft-yellow transition-colors duration-200 cursor-pointer"
            style={{
              left: tooltipPosition.x,
              top: Math.max(0, tooltipPosition.y - 40), // Ensure tooltip doesn't go off-screen
            }}
            onClick={() => handleHighlight(selectionRange)}
          >
            Highlight text
          </div>
        )}
      </div>
    </div>
  );
};
