
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckInConfetti } from './CheckInConfetti';

interface CheckInBannerProps {
  onToggle: (enabled: boolean) => void;
  initialEnabled?: boolean;
}

export const CheckInBanner: React.FC<CheckInBannerProps> = ({ onToggle, initialEnabled = false }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showThankYouNote, setShowThankYouNote] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use safely access env vars in browser environment
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Log component mount for debugging
  useEffect(() => {
    if (isDevelopment) {
      console.log('CheckInBanner mounted with props:', { initialEnabled, enabled, showConfetti });
    }
  }, [initialEnabled, enabled, showConfetti, isDevelopment]);

  const handleToggle = async () => {
    const newState = !enabled;
    setEnabled(newState);
    
    if (newState) {
      // User is turning check-ins on
      setShowConfetti(true);
      setShowThankYouNote(true);
      setShowConfirmation(true);
      
      if (isDevelopment) {
        console.log('Confetti animation triggered:', { showConfetti });
      }
      
      // Request notification permission if needed
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Notification permission required",
            description: "Please allow notifications to receive check-ins",
            variant: "destructive"
          });
          setEnabled(false);
          setShowConfetti(false);
          setShowThankYouNote(false);
          setShowConfirmation(false);
          return;
        }
      }
      
      // Register service worker for notifications
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
        } catch (error) {
          console.error('Service Worker registration failed:', error);
          toast({
            title: "Check-in setup failed",
            description: "We couldn't set up notifications properly",
            variant: "destructive"
          });
          setEnabled(false);
          setShowConfetti(false);
          setShowThankYouNote(false);
          setShowConfirmation(false);
          return;
        }
      }
      
      // Hide the thank you note after the animation sequence completes
      setTimeout(() => {
        setShowThankYouNote(false);
      }, 1500);
      
      // Log analytics event
      try {
        console.log("Analytics: checkin_toggle_on");
      } catch (error) {
        console.error("Failed to log analytics:", error);
      }
    } else {
      // User is turning check-ins off
      setShowConfirmation(false);
      
      // Log analytics event
      try {
        console.log("Analytics: checkin_toggle_off");
      } catch (error) {
        console.error("Failed to log analytics:", error);
      }
    }
    
    // Notify parent component of the change
    onToggle(newState);
  };

  // Store user preference in localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('gentlee-checkin-enabled', JSON.stringify(enabled));
      } catch (error) {
        console.error("Error saving check-in preferences:", error);
      }
    }
  }, [enabled, user]);

  // Force trigger confetti in development mode for testing
  useEffect(() => {
    if (isDevelopment && enabled && showConfetti) {
      // Add a small delay to ensure the component is fully rendered
      console.log('Development mode: Force showing confetti animation');
      
      // Give the browser a moment to render before triggering the animation
      const timer = setTimeout(() => {
        // Explicitly trigger confetti animation by toggling it off and on
        setShowConfetti(false);
        setTimeout(() => setShowConfetti(true), 50);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isDevelopment, enabled, showConfetti]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: enabled && showConfetti ? [1, 1.1, 1] : 1 
        }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ 
          duration: 0.12,
          scale: { duration: 0.15 }
        }}
        className="check-in-banner bg-white/85 rounded-xl shadow-sm mb-4 h-[56px] flex items-center justify-between relative overflow-hidden px-5 py-4"
        style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="w-full flex items-center justify-between relative">
          <div className="flex items-center">
            {/* Sprout icon */}
            <span className="text-[24px] mr-3">🌱</span>
            {showConfirmation ? (
              <p className="text-[#333333] text-base leading-6 font-medium">
                Lovely! You're all set! I'll check in tomorrow!
              </p>
            ) : (
              <p className="text-[#333333] text-base leading-6 font-medium">
                Can I check in with you now and then?
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {showConfirmation ? (
              // Don't show any toggle when in confirmation state
              <></>
            ) : (
              <Button
                variant="outline"
                className="border-[#E8E6F5] hover:bg-[#E8E6F5] hover:text-deep-charcoal text-deep-charcoal px-4 py-2 h-auto font-medium"
                onClick={handleToggle}
              >
                Yes, please
              </Button>
            )}
          </div>
          
          {/* Thank you note that appears and disappears */}
          <AnimatePresence>
            {showThankYouNote && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  opacity: { duration: 0.2 },
                  exit: { duration: 0.3 }
                }}
                className="absolute top-[-48px] left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-white/90 px-4 py-2 rounded-full shadow-sm">
                  <p className="text-deep-charcoal text-sm font-medium">Thank you! 💫</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Confetti animation overlay */}
          <CheckInConfetti isActive={showConfetti} prefersReducedMotion={prefersReducedMotion} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
