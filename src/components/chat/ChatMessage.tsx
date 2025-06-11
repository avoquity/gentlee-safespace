
import React, { useState, useRef, useEffect } from 'react';
import { Message, Highlight } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { HighlightedText } from './HighlightedText';
import { createHighlight, removeHighlight } from '@/utils/highlightUtils';
import { Highlighter } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { MicroCelebration } from './MicroCelebration';

interface ChatMessageProps {
  message: Message;
  highlights: Highlight[];
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
  showInsight?: boolean;
  insightText?: string;
  isFirstTimeUser?: boolean;
}

export const ChatMessage = ({ 
  message, 
  highlights, 
  onHighlightChange, 
  onHighlightRemove,
  showInsight = false,
  insightText = '',
  isFirstTimeUser = false
}: ChatMessageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [showHighlightTooltip, setShowHighlightTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'validation' | 'insight' | 'breakthrough'>('validation');
  const messageRef = useRef<HTMLDivElement>(null);

  // Trigger micro-celebration for emotional moments in first-time user AI responses
  useEffect(() => {
    if (message.sender === 'ai' && isFirstTimeUser && message.text) {
      // Look for emotionally validating phrases
      const validationPhrases = [
        'you\'re being heard', 'you\'re not alone', 'makes sense', 'understandable',
        'valid', 'important', 'matters', 'see you', 'hear you', 'brave', 'courage',
        'strength', 'wisdom', 'insight', 'beautiful', 'powerful'
      ];

      const hasValidation = validationPhrases.some(phrase => 
        message.text.toLowerCase().includes(phrase)
      );

      if (hasValidation) {
        // Delay to let the message appear first
        setTimeout(() => {
          setCelebrationType('validation');
          setShowCelebration(true);
        }, 1000);
      }
    }
  }, [message, isFirstTimeUser]);

  // Trigger celebration when insight is shown
  useEffect(() => {
    if (showInsight && insightText && isFirstTimeUser) {
      setTimeout(() => {
        setCelebrationType('insight');
        setShowCelebration(true);
      }, 2000);
    }
  }, [showInsight, insightText, isFirstTimeUser]);

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

      // Trigger celebration for highlighting
      if (isFirstTimeUser) {
        setCelebrationType('breakthrough');
        setShowCelebration(true);
      }
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
  };

  return (
    <>
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
          
          {/* Show the insight card after this AI message if applicable */}
          {message.sender === 'ai' && showInsight && insightText && (
            <InsightCard 
              insight={insightText}
              isPersonalized={isFirstTimeUser}
            />
          )}

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

      <MicroCelebration
        trigger={showCelebration}
        type={celebrationType}
        onComplete={() => setShowCelebration(false)}
      />
    </>
  );
};
