
import React from 'react';
import { motion } from 'framer-motion';

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
      className="px-6 py-3 rounded-full border border-deep-charcoal bg-transparent text-deep-charcoal hover:bg-gray-50 transition-all duration-200 text-sm font-poppins"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      {suggestion}
    </motion.button>
  );
};

export default ChatSuggestionButton;
