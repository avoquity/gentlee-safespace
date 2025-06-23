
import React, { useState, useRef, useEffect } from 'react';
import { Message, Highlight } from '@/types/chat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { HighlightedText } from './HighlightedText';
import { createHighlight, removeHighlight } from '@/utils/highlightUtils';
import { Highlighter, Volume2 } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { MicroCelebration } from './MicroCelebration';
import { useMessageTTS } from '@/hooks/useMessageTTS';
import { Button } from '@/components/ui/button';

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
  const { isPlaying, speakMessage } = useMessageTTS();

  // Enhanced trigger for micro-celebration on AI responses for first-time users
  useEffect(() => {
    if (message.sender === 'ai' && isFirstTimeUser && message.text) {
      console.log('🔍 Checking AI message for validation phrases:', message.text);
      
      // Expanded validation phrases that match our enhanced AI prompts
      const validationPhrases = [
        'courage', 'brave', 'strength', 'hear you', 'see you', 'being heard',
        'makes sense', 'understandable', 'valid', 'important', 'matters',
        'wise', 'wisdom', 'insight', 'beautiful', 'powerful', 'human',
        'not alone', 'carrying', 'holding', 'deserve', 'asking for',
        'your heart', 'your pain', 'your words', 'speaking', 'sharing',
        'safe', 'space', 'gentle', 'kind', 'compassion', 'understanding',
        'feel', 'feeling', 'emotion', 'difficult', 'hard', 'tough'
      ];

      const hasValidation = validationPhrases.some(phrase => 
        message.text.toLowerCase().includes(phrase.toLowerCase())
      );

      console.log('🎯 Found validation phrase:', hasValidation);

      if (hasValidation) {
        // Delay to let the message appear first
        setTimeout(() => {
          console.log('🎉 Triggering validation celebration');
          setCelebrationType('validation');
          setShowCelebration(true);
        }, 1500);
      }
    }
  }, [message, isFirstTimeUser]);

  // Trigger celebration when insight is shown
  useEffect(() => {
    if (showInsight && insightText && isFirstTimeUser) {
      console.log('🎯 Triggering insight celebration for first-time user');
      setTimeout(() => {
        setCelebrationType('insight');
        setShowCelebration(true);
      }, 2500);
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

  const handleSpeakMessage = () => {
    speakMessage(message.text);
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
          {/* Voice icon for AI messages */}
          {message.sender === 'ai' && (
            <Button
              onClick={handleSpeakMessage}
              variant="ghost"
              size="sm"
              className={`absolute top-2 left-2 h-6 w-6 p-0 rounded-full transition-colors ${
                isPlaying ? 'bg-muted-sage text-white' : 'hover:bg-muted-sage/20'
              }`}
            >
              <Volume2 className="w-3 h-3" />
            </Button>
          )}

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
              className="fixed z-50 bg-white shadow-lg rounded-lg px-4 py-2 transform -translate-x-1/2 flex items-center gap-2 text-sm text-gray-700 hover:text-white hover:bg-yellow-500 transition-colors duration-200 cursor-pointer"
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
