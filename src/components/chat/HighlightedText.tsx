
import React from 'react';
import { Highlight } from '@/types/chat';

interface HighlightedTextProps {
  text: string;
  highlights: Highlight[];
  onRemoveHighlight: (id: number) => void;
}

export const HighlightedText = ({ text, highlights, onRemoveHighlight }: HighlightedTextProps) => {
  const renderTextWithHighlights = () => {
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

      // Add highlighted text with tooltip container
      parts.push(
        <span
          key={`highlight-${highlight.id}`}
          className="relative inline-block group"
        >
          <span className="bg-[#F5D76E] cursor-pointer">
            {text.slice(highlight.start_index, highlight.end_index)}
          </span>
          <span
            className="opacity-0 group-hover:opacity-100 absolute left-1/2 -translate-x-1/2 -top-10 
                     bg-white shadow-lg rounded-lg px-4 py-2 text-sm text-deep-charcoal 
                     hover:text-white hover:bg-soft-yellow transition-all duration-200 cursor-pointer
                     pointer-events-none group-hover:pointer-events-auto z-50"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveHighlight(highlight.id);
            }}
          >
            Remove highlight
          </span>
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

  return (
    <p className="text-deep-charcoal text-lg leading-relaxed whitespace-pre-wrap">
      {renderTextWithHighlights()}
    </p>
  );
};
