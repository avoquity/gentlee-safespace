
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

      // Add highlighted text
      parts.push(
        <div
          key={`highlight-${highlight.id}`}
          className="inline-block relative group"
        >
          <span className="bg-[#F5D76E] cursor-pointer">
            {text.slice(highlight.start_index, highlight.end_index)}
          </span>
          <div
            className="invisible group-hover:visible absolute z-50 -top-12 left-1/2 transform -translate-x-1/2 min-w-max"
          >
            <button
              onClick={() => onRemoveHighlight(highlight.id)}
              className="bg-white shadow-lg rounded-lg px-4 py-2 text-sm text-deep-charcoal hover:text-white hover:bg-soft-yellow transition-colors duration-200"
            >
              Remove highlight
            </button>
          </div>
        </div>
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
