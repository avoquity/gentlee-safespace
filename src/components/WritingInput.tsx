
import React, { useState } from 'react';
import { Send } from 'lucide-react';

const suggestedTopics = ["Stress", "Relationships", "Career Change", "Motivation", "Self-Care"];

const WritingInput = () => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      console.log('Starting chat with:', input);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's on your mind lately?"
          className="w-full px-6 py-4 text-lg font-serif bg-white/80 backdrop-blur-sm rounded-full border-2 border-dusty-rose/20 focus:border-dusty-rose focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 pr-32"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 h-12 flex items-center gap-2 rounded-full bg-deep-charcoal text-white hover:bg-dusty-rose transition-colors border-2 border-deep-charcoal hover:border-dusty-rose"
        >
          <span className="font-poppins text-sm">Send</span>
          <Send size={16} />
        </button>
      </form>
      
      <div className="flex flex-wrap gap-3 justify-center">
        {suggestedTopics.map((topic) => (
          <button
            key={topic}
            className="px-6 py-2 rounded-full border border-deep-charcoal text-deep-charcoal hover:bg-deep-charcoal hover:text-white transition-all duration-200 text-sm font-poppins"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WritingInput;
