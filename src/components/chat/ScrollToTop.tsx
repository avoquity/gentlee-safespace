
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScrollToTopProps {
  scrollContainer?: React.RefObject<HTMLElement>;
  isTyping?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ scrollContainer, isTyping = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainer?.current) return;
      const container = scrollContainer.current;
      // If user is scrolled less than 120px from the bottom, show
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollPos = container.scrollTop;
      const distanceFromBottom = maxScroll - scrollPos;
      setIsNearBottom(distanceFromBottom < 120);
      setIsVisible(distanceFromBottom > 60 && !isTyping);
    };

    const targetElement = scrollContainer?.current;
    if (!targetElement) return;
    targetElement.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      targetElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainer, isTyping]);

  const scrollToTop = () => {
    if (scrollContainer?.current) {
      scrollContainer.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Center after the last message (not fixed for mobile)
  return (
    <AnimatePresence>
      {isVisible && !isTyping && (
        <motion.button
          className="flex items-center justify-center rounded-full bg-deep-charcoal/60 hover:bg-deep-charcoal text-white z-50 transition-all duration-300 mx-auto"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: isMobile ? 110 : 42,
            width: 40,
            height: 40,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
