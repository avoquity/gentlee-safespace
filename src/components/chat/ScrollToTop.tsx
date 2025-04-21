import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScrollToTopProps {
  scrollContainer?: React.RefObject<HTMLElement>;
  endRef?: React.RefObject<HTMLDivElement>; // New: reference to the end of the message list
  isTyping?: boolean;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  scrollContainer,
  endRef,
  isTyping = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Listen for input focus events on mobile to hide button when user is typing/focusing input
    if (!isMobile) return;
    const input = document.querySelector('textarea');
    if (!input) return;

    const onFocus = () => setIsFocused(true);
    const onBlur = () => setTimeout(() => setIsFocused(false), 120);

    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);

    return () => {
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
    };
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainer?.current) return;
      const container = scrollContainer.current;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const scrollPos = container.scrollTop;
      const distanceFromBottom = maxScroll - scrollPos;
      // On mobile: show if user is NOT at the bottom (distance > 30px)
      if (isMobile) {
        setIsVisible(distanceFromBottom > 30 && !isFocused && !isTyping);
      } else {
        // Desktop: show if away from bottom + not typing
        setIsVisible(distanceFromBottom > 60 && !isTyping);
      }
    };

    const targetElement = scrollContainer?.current;
    if (!targetElement) return;
    targetElement.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      targetElement.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainer, isTyping, isMobile, isFocused]);

  const scrollToBottom = () => {
    if (scrollContainer?.current) {
      scrollContainer.current.scrollTo({
        top: scrollContainer.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // On mobile, absolutely position the button just under the end of the messages list (`endRef`)
  if (isMobile) {
    return (
      <AnimatePresence>
        {isVisible && !isTyping && !isFocused && endRef?.current && (
          <motion.button
            className="flex items-center justify-center rounded-full bg-deep-charcoal/60 hover:bg-deep-charcoal text-white z-30 transition-all duration-300"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: endRef.current.offsetTop + 18 || undefined, // 18px for nice spacing below messages
              width: 44,
              height: 44,
              minWidth: 44,
              minHeight: 44,
              margin: 0,
              border: 'none',
              padding: 0
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToBottom}
            aria-label="Scroll to most recent message"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  // Desktop: keep old behavior but ensure it's not shown over the input
  return (
    <AnimatePresence>
      {isVisible && !isTyping && (
        <motion.button
          className="flex items-center justify-center rounded-full bg-deep-charcoal/60 hover:bg-deep-charcoal text-white z-30 transition-all duration-300 mx-auto"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 42,
            width: 40,
            height: 40,
            minWidth: 40,
            minHeight: 40,
            border: 'none',
            padding: 0
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToBottom}
          aria-label="Scroll to most recent message"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
