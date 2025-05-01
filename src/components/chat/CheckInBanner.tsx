
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const handleToggle = async () => {
    const newState = !enabled;
    setEnabled(newState);
    
    if (newState) {
      // User is turning check-ins on
      setShowConfetti(true);
      
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
          return;
        }
      }
      
      // Hide confetti after animation completes
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
      
      // Log analytics event
      try {
        // Simple local analytics logging
        console.log("Analytics: checkin_toggle_on");
      } catch (error) {
        console.error("Failed to log analytics:", error);
      }
    } else {
      // User is turning check-ins off
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
        
        // In a production app, we would also update the user's profile in the database
      } catch (error) {
        console.error("Error saving check-in preferences:", error);
      }
    }
  }, [enabled, user]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.12 }}
        className="bg-[#F2F0EB] border border-deep-charcoal/10 rounded-lg shadow-sm mb-4 h-[56px] flex items-center justify-between relative overflow-hidden"
      >
        {enabled ? (
          <div className="w-full flex items-center justify-between px-4">
            <p className="text-[#1D1D1D] text-[17px] leading-6 font-medium">
              {showConfetti ? "Lovely—you're all set! I'll check in each morning. 🌅" : "Check-ins are on. I'll check in each morning. 🌅"}
            </p>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full"
              onClick={handleToggle}
              aria-label="Turn off check-ins"
            >
              <X size={16} />
            </button>
            
            {/* Confetti animation overlay */}
            <CheckInConfetti isActive={showConfetti} prefersReducedMotion={prefersReducedMotion} />
          </div>
        ) : (
          <div className="w-full flex items-center justify-between px-4">
            <p className="text-[#1D1D1D] text-[17px] leading-6 font-medium">
              Would it help if I checked in with you now and then? 🌱
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-[#E8E6F5] hover:bg-[#E8E6F5] hover:text-deep-charcoal text-deep-charcoal px-4 py-2 h-auto font-medium"
                onClick={handleToggle}
              >
                On
              </Button>
              {/* X button intentionally removed when banner is in "off" state based on the requirements */}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
