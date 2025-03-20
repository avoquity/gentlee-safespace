
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScrollToTopProps {
  scrollContainer?: React.RefObject<HTMLElement>;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ scrollContainer }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight * 1.5;
      const scrollElement = scrollContainer?.current || document.documentElement;
      const scrollPosition = scrollElement.scrollTop;
      
      setIsVisible(scrollPosition > threshold);
    };
    
    // Add scroll event listener
    const scrollElement = scrollContainer?.current || window;
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    // Cleanup
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainer]);
  
  const scrollToTop = () => {
    const scrollElement = scrollContainer?.current || window;
    
    if (scrollContainer?.current) {
      scrollElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed flex items-center justify-center rounded-full bg-deep-charcoal/60 hover:bg-deep-charcoal shadow-md text-white z-50 transition-all duration-300"
          style={{
            right: isMobile ? 16 : 24,
            bottom: isMobile ? 80 : 24,
            width: 40,
            height: 40
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
