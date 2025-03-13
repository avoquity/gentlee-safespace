import React, { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Heart, Lightbulb, Sparkle, Star, Moon, Sun, Cloud, Compass, MessageCircle, Quote, ArrowLeft, ArrowRight } from 'lucide-react';
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
  const [direction, setDirection] = useState<"left" | "right">("right");
  const touchStartX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

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
    touchStartTime.current = Date.now();
  };

  // Handle touch move for mobile swipe
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || filteredSuggestions.length <= 1) return;

    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const timeDiff = Date.now() - touchStartTime.current;
    
    // Only register swipe if it's been less than 300ms (to ensure it's a swipe and not a long press)
    if (timeDiff > 300) return;
    
    // Swipe right to left (next suggestion)
    if (diff > 50) {
      setDirection("left");
      goToNextSuggestion();
      touchStartX.current = touchEndX;
    }
    // Swipe left to right (previous suggestion)
    else if (diff < -50) {
      setDirection("right");
      goToPrevSuggestion();
      touchStartX.current = touchEndX;
    }
  };

  const goToNextSuggestion = () => {
    setDirection("left");
    setCurrentIndex(prev => (prev + 1) % filteredSuggestions.length);
  };

  const goToPrevSuggestion = () => {
    setDirection("right");
    setCurrentIndex(prev => 
      prev === 0 ? filteredSuggestions.length - 1 : prev - 1
    );
  };

  // Emoji mapping for suggestions - updated with more meaningful icons
  const getEmoji = (index: number) => {
    const icons = [
      <Moon key="moon" className="w-4 h-4 mr-2" />,         // Truth & introspection
      <Star key="star" className="w-4 h-4 mr-2" />,         // Past self
      <Sun key="sun" className="w-4 h-4 mr-2" />,           // Self-kindness
      <Compass key="compass" className="w-4 h-4 mr-2" />,   // Different perspective
      <Heart key="heart" className="w-4 h-4 mr-2" />,       // Deep knowing
      <MessageCircle key="message" className="w-4 h-4 mr-2" />, // Heart speaking
      <Cloud key="cloud" className="w-4 h-4 mr-2" />,       // Words to breathe
      <Quote key="quote" className="w-4 h-4 mr-2" />,       // Truth wrapped in kindness
      <Lightbulb key="lightbulb" className="w-4 h-4 mr-2" />, // Something not seeing
      <Sparkle key="sparkle" className="w-4 h-4 mr-2" />    // Softer with self
    ];
    
    // Randomize which icon is used for each suggestion
    // Use the suggestion as a seed to ensure consistent icons per suggestion
    const suggestionSeed = filteredSuggestions[index].length;
    const iconIndex = suggestionSeed % icons.length;
    return icons[iconIndex];
  };

  // Temporarily hide suggestions on mobile
  if (isMobile || !isFocused || filteredSuggestions.length === 0) {
    return null;
  }

  // Render for desktop
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
};
