
import React from 'react';
import { motion } from 'framer-motion';
import { Pen } from 'lucide-react';

interface ChatSuggestionButtonProps {
  suggestion: string;
  index: number;
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

const ChatSuggestionButton = ({ 
  suggestion, 
  index, 
  onSuggestionClick, 
  disabled = false 
}: ChatSuggestionButtonProps) => {
  return (
    <motion.button
      key={index}
      onClick={() => onSuggestionClick(suggestion)}
      className="px-6 py-3 rounded-full border border-deep-charcoal bg-transparent text-deep-charcoal hover:bg-gray-50 transition-all duration-200 text-sm font-poppins flex items-center flex-1"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="relative mr-2 flex-shrink-0">
        <Pen size={16} className="text-muted-sage" />
        {/* Magic dust particles */}
        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-soft-yellow rounded-full animate-pulse" />
        <span className="absolute -bottom-1 -right-1 w-1 h-1 bg-dusty-rose rounded-full animate-pulse animation-delay-2000" />
        <span className="absolute -top-1 -left-1 w-1 h-1 bg-muted-sage rounded-full animate-pulse animation-delay-4000" />
      </div>
      <span className="line-clamp-1">{suggestion}</span>
    </motion.button>
  );
};

export default ChatSuggestionButton;
