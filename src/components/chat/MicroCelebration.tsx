
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Star } from 'lucide-react';

interface MicroCelebrationProps {
  trigger: boolean;
  type?: 'validation' | 'insight' | 'breakthrough';
  onComplete?: () => void;
}

export const MicroCelebration = ({ 
  trigger, 
  type = 'validation', 
  onComplete 
}: MicroCelebrationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trigger) {
      console.log('🎉 Micro-celebration triggered:', type);
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 3000); // Increased duration to make it more visible
      
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete, type]);

  const getIcon = () => {
    switch (type) {
      case 'validation':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'insight':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'breakthrough':
        return <Star className="w-5 h-5 text-blue-500" />;
      default:
        return <Heart className="w-5 h-5 text-pink-500" />;
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'validation':
        return 'You\'re being heard ✨';
      case 'insight':
        return 'Beautiful insight 💫';
      case 'breakthrough':
        return 'Something shifted ⭐';
      default:
        return 'You\'re being heard ✨';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className="fixed top-20 right-4 z-50 pointer-events-none"
      >
        <div className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 border border-gray-200">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.6, repeat: 1 }}
          >
            {getIcon()}
          </motion.div>
          <span className="text-sm text-gray-700 font-medium">
            {getMessage()}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
