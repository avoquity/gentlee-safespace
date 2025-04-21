import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Enhanced props for positioning and visibility control.
 */
interface ScrollToTopProps {
  scrollContainer?: React.RefObject<HTMLElement>;
  isTyping?: boolean;
  lastMessageRef?: React.RefObject<HTMLDivElement>;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  scrollContainer,
  isTyping = false,
  lastMessageRef
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  const [inputActive, setInputActive] = useState(false);

  // Track scroll relative to bottom
  useEffect(() => {
    if (!scrollContainer?.current) return;

    const containerEl = scrollContainer.current;
    const handleScroll = () => {
      // Show only if at least 120px away from bottom
      let scrollBottom = 0;
      if ('scrollHeight' in containerEl && 'scrollTop' in containerEl && 'clientHeight' in containerEl) {
        scrollBottom = (containerEl as any).scrollHeight - (containerEl as any).scrollTop - (containerEl as any).clientHeight;
      } else if ('scrollY' in window) {
        scrollBottom = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      }
      setIsVisible(scrollBottom > 120);
    };

    containerEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      containerEl.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainer]);

  // Hide when input/typing active OR on touch of input
  useEffect(() => {
    setInputActive(isTyping);
  }, [isTyping]);

  // Handler to scroll to last message and focus input
  const handleScrollToLast = () => {
    if (lastMessageRef?.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  // Only show if not typing and user is scrolled up
  const shouldShow = isVisible && !inputActive;

  // For mobile, place after last message, in desktop keep bottom right.
  // Center the button at bottom for mobile, not floating.

  const floatingButton = (
    <motion.button
      className="fixed flex items-center justify-center rounded-full bg-deep-charcoal/60 hover:bg-deep-charcoal shadow-md text-white z-50 transition-all duration-300"
      style={{
        right: isMobile ? '50%' : 24,
        transform: isMobile ? 'translateX(50%)' : undefined,
        bottom: isMobile ? 88 : 24,
        width: 40,
        height: 40,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleScrollToLast}
      aria-label="Scroll to bottom"
    >
      <ArrowUp className="w-5 h-5" />
    </motion.button>
  );

  const inlineButtonMobile = (
    <motion.button
      className="flex items-center justify-center mx-auto mb-4 rounded-full bg-deep-charcoal/60 hover:bg-deep-charcoal shadow-md text-white transition-all duration-300"
      style={{ width: 44, height: 44 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleScrollToLast}
      aria-label="Scroll to bottom"
    >
      <ArrowUp className="w-5 h-5" />
    </motion.button>
  );

  if (!shouldShow) return null;

  // On mobile, render after last message (using portal so it's after the message list)
  if (isMobile && lastMessageRef?.current) {
    return (
      <AnimatePresence>
        {/* Will be inserted by parent, just above input bar */}
        <div className="w-full flex justify-center">{inlineButtonMobile}</div>
      </AnimatePresence>
    );
  }

  // On desktop, keep as floating, but hidden if typing/active
  return <AnimatePresence>{floatingButton}</AnimatePresence>;
};
