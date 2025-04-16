
import React, { useEffect, useRef, useState } from 'react';
import { HighlightedText } from './HighlightedText';
import { Highlight, Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { ExpandableMessage } from './ExpandableMessage';

interface ChatMessageProps {
  message: Message;
  highlights: Highlight[];
  onHighlight?: (start: number, end: number, message: Message) => void;
  isLongMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, highlights, onHighlight }) => {
  const [selectedText, setSelectedText] = useState<{ start: number; end: number } | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Find highlights for this message
  const messageHighlights = highlights.filter(h => h.message_id.toString() === message.id);
  
  const handleSelection = () => {
    if (!user || message.sender !== 'ai') return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      return;
    }
    
    // Only process selections within this message
    if (messageRef.current && messageRef.current.contains(selection.anchorNode)) {
      const text = message.text;
      const selectionText = selection.toString();
      
      if (!selectionText || selectionText.length < 3) {
        setSelectedText(null);
        return;
      }
      
      const anchorOffset = selection.anchorOffset;
      const focusOffset = selection.focusOffset;
      const range = selection.getRangeAt(0);
      
      // Find the offset within the text
      let startContainer = range.startContainer;
      let startOffset = range.startOffset;
      
      // Adjust for nested text nodes
      let textOffset = 0;
      if (messageRef.current !== startContainer && startContainer.nodeType === Node.TEXT_NODE) {
        let node = startContainer;
        while (node.previousSibling) {
          if (node.previousSibling.nodeType === Node.TEXT_NODE) {
            textOffset += node.previousSibling.textContent?.length || 0;
          } else if (node.previousSibling.nodeType === Node.ELEMENT_NODE) {
            textOffset += node.previousSibling.textContent?.length || 0;
          }
          node = node.previousSibling;
        }
      }
      
      // Calculate the actual start and end points in the text
      const start = Math.min(textOffset + startOffset, textOffset + startOffset + selectionText.length);
      const end = Math.max(textOffset + startOffset, textOffset + startOffset + selectionText.length);
      
      setSelectedText({ start, end });
    }
  };
  
  // Reset selection when clicking outside the message
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(e.target as Node)) {
        setSelectedText(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleHighlightClick = () => {
    if (selectedText && message && onHighlight) {
      onHighlight(selectedText.start, selectedText.end, message);
      setSelectedText(null);
    }
  };
  
  return (
    <div
      ref={messageRef}
      className={`chat-message py-4 first:pt-0 last:pb-0 ${
        message.sender === 'user' ? 'user-message' : 'ai-message'
      }`}
      onMouseUp={handleSelection}
    >
      <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[85%] ${
            message.sender === 'user'
              ? 'bg-muted-sage text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl rounded-tr-sm px-4 py-3'
              : 'bg-light-sage text-deep-charcoal rounded-tr-2xl rounded-br-2xl rounded-bl-2xl rounded-tl-sm px-4 py-3'
          } shadow-sm text-opacity-90 leading-relaxed`}
        >
          {message.sender === 'user' ? (
            <ExpandableMessage text={message.text} maxLength={280} />
          ) : (
            <HighlightedText text={message.text} highlights={messageHighlights} />
          )}
          
          {selectedText && message.sender === 'ai' && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleHighlightClick}
                className="text-xs bg-muted-sage text-white px-2 py-1 rounded-full"
              >
                Highlight
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
