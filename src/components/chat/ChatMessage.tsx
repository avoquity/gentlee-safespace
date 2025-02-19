import React, { useEffect, useState } from 'react';
import { Message, Highlight } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Highlighter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
    const fetchHighlights = async () => {
      try {
        if (!message?.id) {
          console.error('No message ID provided');
          return;
        }

        const messageId = typeof message.id === 'string' ? parseInt(message.id) : message.id;
        
        if (isNaN(messageId)) {
          console.error('Invalid message ID:', message.id);
          return;
        }

        const { data, error } = await supabase
          .from('highlights')
          .select('*')
          .eq('message_id', messageId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching highlights:', error);
          if (error.code === 'PGRST116') {
            toast({
              title: "Authentication required",
              description: "Please sign in to view highlights",
              variant: "destructive"
            });
          }
          return;
        }

        setHighlights(data || []);
      } catch (err) {
        console.error('Error in fetchHighlights:', err);
      }
    };

    if (user && message?.id) {
      fetchHighlights();
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
      const messageId = typeof message.id === 'string' ? parseInt(message.id) : message.id;
      
      if (isNaN(messageId)) {
        throw new Error('Invalid message ID');
      }

      // First verify the message exists
      const { data: messageExists, error: messageError } = await supabase
        .from('messages')
        .select('id')
        .eq('id', messageId)
        .single();

      if (messageError || !messageExists) {
        throw new Error('Message not found');
      }

      const { data, error } = await supabase
        .from('highlights')
        .insert([{
          message_id: messageId,
          start_index: selectionRange.start,
          end_index: selectionRange.end,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('You can only highlight messages from your own chats');
        }
        throw error;
      }

      setHighlights(prev => [...prev, data]);
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
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', highlightId);

      if (error) {
        if (error.code === 'PGRST116') {
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

    // Calculate the start and end indices relative to the message text
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(range.startContainer.parentElement!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;

    setSelectedText(text);
    setSelectionRange({ start, end: start + text.length });

    // Get the selection coordinates for the popover
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
          <p className="text-deep-charcoal text-[17px] leading-relaxed whitespace-pre-wrap">
            {renderTextWithHighlights()}
          </p>
        </div>
      </div>

      {isPopoverOpen && selectedText && (
        <div
          style={{
            position: 'fixed',
            left: `${popoverPosition.x}px`,
            top: `${popoverPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 50
          }}
        >
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-none shadow-lg hover:bg-soft-yellow transition-colors duration-200"
              >
                <Highlighter className="w-4 h-4 mr-2" />
                Highlight
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Selected text:</p>
                <p className="text-sm font-medium">{selectedText}</p>
                <div className="flex justify-end">
                  <Button onClick={handleHighlight} className="bg-soft-yellow hover:bg-soft-yellow/90 text-deep-charcoal">
                    Add Highlight
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </>
  );
};
