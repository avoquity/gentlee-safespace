
import React from 'react';
import ChatSuggestionButton from './ChatSuggestionButton';

interface ChatSuggestionsDisplayProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  hasReachedLimit: boolean;
}

const ChatSuggestionsDisplay = ({ 
  suggestions, 
  onSuggestionClick, 
  hasReachedLimit 
}: ChatSuggestionsDisplayProps) => {
  // Only take the first 4 suggestions
  const limitedSuggestions = suggestions.slice(0, 4);
  
  // Split suggestions into two rows of two
  const firstRow = limitedSuggestions.slice(0, 2);
  const secondRow = limitedSuggestions.slice(2, 4);
  
  return (
    <div className="flex flex-col items-center justify-center space-y-3 mt-4 mb-8 w-full">
      {/* First row */}
      <div className="flex justify-center gap-3 w-full max-w-4xl mx-auto">
        {firstRow.map((suggestion, index) => (
          <ChatSuggestionButton
            key={index}
            suggestion={suggestion}
            index={index}
            onSuggestionClick={onSuggestionClick}
            disabled={hasReachedLimit}
          />
        ))}
      </div>
      
      {/* Second row */}
      <div className="flex justify-center gap-3 w-full max-w-4xl mx-auto">
        {secondRow.map((suggestion, index) => (
          <ChatSuggestionButton
            key={index + 2}
            suggestion={suggestion}
            index={index + 2}
            onSuggestionClick={onSuggestionClick}
            disabled={hasReachedLimit}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestionsDisplay;
