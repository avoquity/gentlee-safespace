
import React from 'react';

export const ChatTypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-transparent max-w-[80%] px-6 py-4 rounded-2xl">
        <div className="flex space-x-2">
          <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce [animation-delay:0.2s]" />
          <span className="w-2 h-2 bg-deep-charcoal/40 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
};
