
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
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  const getIcon = () => {
    switch (type) {
      case 'validation':
        return <Heart className="w-4 h-4 text-gentle-sage" />;
      case 'insight':
        return <Sparkles className="w-4 h-4 text-soft-yellow" />;
      case 'breakthrough':
        return <Star className="w-4 h-4 text-gentle-sage" />;
      default:
        return <Heart className="w-4 h-4 text-gentle-sage" />;
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed top-20 right-4 z-50"
        >
          <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl px-4 py-3 flex items-center gap-3 border border-gentle-sage/20">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5 }}
            >
              {getIcon()}
            </motion.div>
            <span className="text-sm text-deep-charcoal/80 font-medium">
              {getMessage()}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
