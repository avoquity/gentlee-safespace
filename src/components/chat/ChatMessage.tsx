
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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowHighlightTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleHighlight = async (range: { start: number; end: number }) => {
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

    // Get selection coordinates
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Calculate the start and end offsets of the selection
    const startNode = selection.anchorNode;
    const endNode = selection.focusNode;

    if (!startNode || !endNode || !messageRef.current) return;
    
    // Find all text nodes in the message element
    const textNodes: Node[] = [];
    const findTextNodes = (node: Node) => {
      if (node.nodeType === 3) { // Text node
        textNodes.push(node);
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          findTextNodes(node.childNodes[i]);
        }
      }
    };
    
    findTextNodes(messageRef.current);
    
    // Calculate start and end indices
    let startOffset = selection.anchorOffset;
    let endOffset = selection.focusOffset;
    
    // Add lengths of previous text nodes to get absolute indices
    for (let i = 0; i < textNodes.length; i++) {
      if (textNodes[i] === startNode) {
        break;
      }
      startOffset += textNodes[i].textContent?.length || 0;
    }
    
    // If start and end nodes are the same, adjust end offset
    if (startNode === endNode) {
      endOffset = startOffset + (selection.focusOffset - selection.anchorOffset);
    } else {
      endOffset = startOffset + text.length;
    }
    
    // Set selection range and tooltip position
    setSelectedText(text);
    setSelectionRange({ start: startOffset, end: endOffset });
    
    // Get accurate position for the tooltip
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    setTooltipPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top + scrollTop - 10 // Position above the text with a small gap
    });
    
    setShowHighlightTooltip(true);
    console.log(showHighlightTooltip);
    console.log(selectionRange);
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
          onRemoveHighlight={handleRemoveHighlight}
        />

        {showHighlightTooltip && selectionRange && (
          <div 
            className="fixed z-50 bg-white shadow-lg rounded-lg px-4 py-2 transform -translate-x-1/2 flex items-center gap-2 text-sm text-deep-charcoal hover:text-white hover:bg-soft-yellow transition-colors duration-200 cursor-pointer"
            style={{
              left: tooltipPosition.x,
              top: Math.max(0, tooltipPosition.y - 40), // Ensure tooltip doesn't go off-screen
            }}
            onClick={() => handleHighlight(selectionRange)}
          >
            <Highlighter size={16} />
            Highlight text
          </div>
        )}
      </div>
    </div>
  );
};
