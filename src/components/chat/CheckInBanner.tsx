import React, { useState, useEffect } from 'react';
import { X, Heart, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
      } catch (error) {
        console.error("Error saving check-in preferences:", error);
      }
    }
  }, [enabled, user]);

  // New UI according to requirements
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.12 }}
        className="bg-white/85 rounded-xl shadow-sm mb-4 h-[56px] flex items-center justify-between relative overflow-hidden px-5 py-4"
        style={{ boxShadow: '0px 4px 8px rgba(0,0,0,0.05)' }}
      >
        <div className="w-full flex items-center justify-between relative">
          <div className="flex items-center">
            <Waves size={24} className="text-[#6D6A8A] mr-3" />
            <p className="text-[#333333] text-base leading-6 font-medium">
              Can I check in with you now and then?
            </p>
          </div>

          <div className="flex items-center gap-4">
            {enabled ? (
              <div className="flex items-center">
                <Switch 
                  checked={enabled} 
                  onCheckedChange={handleToggle} 
                  className={`${enabled ? 'bg-[#6D6A8A]' : 'bg-[#E8E6F5]'} relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors`}
                />
                <button
                  className="text-[#999999] ml-2 p-1 hover:text-gray-600 transition-colors"
                  onClick={handleToggle}
                  aria-label="Turn off check-ins"
                >
                  <X size={16} />
                </button>
              </div>
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
          
          {/* Confetti animation overlay */}
          <CheckInConfetti isActive={showConfetti} prefersReducedMotion={prefersReducedMotion} />
          
          {/* Show temporary confirmation message when enabled */}
          {enabled && showConfetti && (
            <div className="absolute inset-0 bg-white/85 flex items-center px-5 animate-fade-in">
              <p className="text-[#333333] text-base leading-6 font-medium">
                Lovely! I'll check in soon!
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
