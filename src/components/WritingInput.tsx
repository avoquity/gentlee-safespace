
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const suggestedTopics = ["Stress", "Relationships", "Career Change", "Motivation"];

const WritingInput = () => {
  const [input, setInput] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      console.log('Starting chat with:', input);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <form onSubmit={handleSubmit} className="relative w-4/5 mx-auto mb-10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's on your mind lately?"
          className="w-full px-1 py-3 text-lg bg-transparent border-b-2 border-deep-charcoal focus:border-deep-charcoal focus:outline-none text-deep-charcoal placeholder:text-deep-charcoal/50 pr-40"
        />
        <button
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 px-6 py-2 rounded-full border border-deep-charcoal flex items-center gap-2 text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-all duration-200"
        >
          <span className="font-poppins text-base">Send</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
      
      <div className="flex flex-wrap gap-4 justify-center">
        {suggestedTopics.map((topic) => (
          <button
            key={topic}
            className="px-6 py-2 rounded-full border border-deep-charcoal bg-transparent text-deep-charcoal text-sm font-poppins cursor-default"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WritingInput;
