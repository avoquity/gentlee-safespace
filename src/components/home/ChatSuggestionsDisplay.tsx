
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
  return (
    <div className="flex flex-col items-center justify-center space-y-3 mt-4 mb-8 w-full max-w-2xl mx-auto">
      <div className="flex flex-wrap justify-center gap-3 w-full">
        {suggestions.map((suggestion, index) => (
          <ChatSuggestionButton
            key={index}
            suggestion={suggestion}
            index={index}
            onSuggestionClick={onSuggestionClick}
            disabled={hasReachedLimit}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestionsDisplay;
