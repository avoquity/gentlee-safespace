
import React from 'react';
import { useLocation } from 'react-router-dom';

interface LocationState {
  initialMessage?: string;
}

const Chat = () => {
  const location = useLocation();
  const { initialMessage } = (location.state as LocationState) || {};

  return (
    <div className="min-h-screen bg-soft-ivory p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto pt-24">
        <div className="space-y-4">
          {initialMessage && (
            <div className="p-4 rounded-lg bg-white/50 backdrop-blur-sm shadow-sm">
              <p className="text-deep-charcoal">{initialMessage}</p>
            </div>
          )}
          
          <div className="mt-8">
            {/* Placeholder for chat messages */}
            <div className="space-y-4">
              {/* We'll implement the chat messages here in the next step */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
