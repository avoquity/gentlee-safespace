import React, { useEffect, useState } from 'react';
import { Message, Highlight } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      // Convert string ID to number for Supabase query
      const messageId = parseInt(message.id);
      if (isNaN(messageId)) {
        console.error('Invalid message ID:', message.id);
        return;
      }

      const { data, error } = await supabase
        .from('highlights')
        .select('id, message_id, start_index, end_index, created_at')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching highlights:', error);
        return;
      }

      setHighlights(data || []);
    };

    if (user) {
      fetchHighlights();
    } else {
      setHighlights([]);
    }
  }, [message.id, user]);

  const handleHighlight = async (start: number, end: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to highlight text",
        variant: "destructive"
      });
      return;
    }

    try {
      const messageId = parseInt(message.id);
      if (isNaN(messageId)) {
        throw new Error('Invalid message ID');
      }

      const { data, error } = await supabase
        .from('highlights')
        .insert([{
          message_id: messageId,
          start_index: start,
          end_index: end
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '42501') {
          throw new Error('You can only highlight messages from your own chats');
        }
        throw error;
      }

      if (data) {
        setHighlights(prev => [...prev, data]);
        toast({
          title: "Text highlighted",
          description: "The selected text has been highlighted successfully."
        });
      }
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
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', highlightId);

      if (error) {
        if (error.code === '42501') {
          throw new Error('You can only remove highlights from your own chats');
        }
        throw error;
      }

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

  const renderTextWithHighlights = () => {
    const text = message.text;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    // Sort highlights by start_index
    const sortedHighlights = [...highlights].sort((a, b) => a.start_index - b.start_index);

    sortedHighlights.forEach((highlight, index) => {
      // Add non-highlighted text before this highlight
      if (highlight.start_index > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.slice(lastIndex, highlight.start_index)}
          </span>
        );
      }

      // Add highlighted text
      parts.push(
        <span
          key={`highlight-${highlight.id}`}
          className="bg-[#F5D76E] relative group cursor-pointer"
        >
          {text.slice(highlight.start_index, highlight.end_index)}
          <button
            onClick={() => handleRemoveHighlight(highlight.id)}
            className="absolute hidden group-hover:block bg-white shadow-lg rounded-lg px-4 py-2 -top-10 left-1/2 transform -translate-x-1/2 text-sm text-deep-charcoal hover:text-white hover:bg-soft-yellow transition-colors duration-200"
          >
            Remove highlight
          </button>
        </span>
      );

      lastIndex = highlight.end_index;
    });

    // Add any remaining non-highlighted text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-last">{text.slice(lastIndex)}</span>
      );
    }

    return parts;
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();

    if (!text) return;

    // Calculate the start and end indices relative to the message text
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(range.startContainer.parentElement!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + text.length;

    setSelectedRange({ start, end });
    handleHighlight(start, end);
    selection.removeAllRanges();
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-6 py-4 rounded-2xl ${
          message.sender === 'user' ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
        onMouseUp={handleTextSelection}
      >
        <p className="text-deep-charcoal text-[17px] leading-relaxed whitespace-pre-wrap">
          {renderTextWithHighlights()}
        </p>
      </div>
    </div>
  );
};
