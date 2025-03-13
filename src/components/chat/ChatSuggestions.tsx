
import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Heart, Lightbulb, Sparkle, Flower, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuggestionProps {
  suggestions: string[];
  inputValue: string;
  onSuggestionClick: (suggestion: string) => void;
  isFocused: boolean;
}

export const ChatSuggestions: React.FC<SuggestionProps> = ({
  suggestions,
  inputValue,
  onSuggestionClick,
  isFocused,
}) => {
  const isMobile = useIsMobile();
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(suggestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number>(0);

  // Filter suggestions based on input value
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredSuggestions(suggestions);
      return;
    }

    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredSuggestions(filtered.length > 0 ? filtered : suggestions);
  }, [inputValue, suggestions]);

  // Reset current index when suggestions change
  useEffect(() => {
    setCurrentIndex(0);
  }, [filteredSuggestions]);

  // Handle touch start for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // Handle touch move for mobile swipe
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || filteredSuggestions.length <= 1) return;

    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe right to left (next suggestion)
    if (diff > 50) {
      setCurrentIndex(prev => (prev + 1) % filteredSuggestions.length);
      touchStartX.current = touchEndX;
    }
    // Swipe left to right (previous suggestion)
    else if (diff < -50) {
      setCurrentIndex(prev => 
        prev === 0 ? filteredSuggestions.length - 1 : prev - 1
      );
      touchStartX.current = touchEndX;
    }
  };

  // Emoji mapping for suggestions
  const getEmoji = (index: number) => {
    const emojis = [
      <Lightbulb key="lightbulb" className="w-4 h-4 mr-2" />,
      <Heart key="heart" className="w-4 h-4 mr-2" />,
      <Sparkle key="sparkle" className="w-4 h-4 mr-2" />,
      <Flower key="flower" className="w-4 h-4 mr-2" />,
      <Star key="star" className="w-4 h-4 mr-2" />
    ];
    return emojis[index % emojis.length];
  };

  if (!isFocused || filteredSuggestions.length === 0) {
    return null;
  }

  // Render for desktop
  if (!isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-md shadow-sm border border-deep-charcoal/10 z-10 overflow-hidden"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
            <motion.div
              key={suggestion}
              className="px-4 py-2.5 cursor-pointer flex items-center hover:bg-[#F8B6B1] hover:font-medium transition-all duration-200"
              onClick={() => onSuggestionClick(suggestion)}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            >
              {getEmoji(index)}
              {suggestion}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Render for mobile
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        className="w-full mt-3 px-4 py-2.5 bg-white rounded-md shadow-sm border border-deep-charcoal/10 cursor-pointer flex items-center justify-center"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={() => onSuggestionClick(filteredSuggestions[currentIndex])}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {getEmoji(currentIndex)}
        <span>{filteredSuggestions[currentIndex]}</span>
      </motion.div>
    </AnimatePresence>
  );
};
