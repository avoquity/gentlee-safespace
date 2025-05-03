
import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface CheckInConfettiProps {
  isActive: boolean;
  prefersReducedMotion: boolean;
}

export const CheckInConfetti: React.FC<CheckInConfettiProps> = ({ isActive, prefersReducedMotion }) => {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Get a reference to the parent banner element
  useEffect(() => {
    if (isActive) {
      // Find the parent banner element
      const banner = document.querySelector('.check-in-banner');
      if (banner) {
        bannerRef.current = banner as HTMLDivElement;
      }
    }
  }, [isActive]);
  
  // Trigger the multi-burst confetti animation when isActive changes to true
  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      if (isDevelopment) {
        console.log("CheckInConfetti - Triggering multi-burst confetti animation");
      }
      
      // Confetti configuration for more calming, vibrant bursts
      const confettiConfig = {
        particleCount: 6,  // 4-6 pieces per burst
        spread: 30,        // narrower fan
        startVelocity: 25, // gentle arc
        gravity: 0.8,      // moderate fall speed
        colors: ['#8C7AE6', '#3CAEA3', '#FF6F61', '#FFD166'], // new vibrant palette
        origin: { y: 0, x: 0.5 }, // default origin (will be updated)
        scalar: 0.8,       // slightly smaller pieces
        shapes: ['circle', 'square'],
        disableForReducedMotion: true
      };
      
      // Set up the multi-burst sequence
      const triggerBurst = (delay: number) => {
        setTimeout(() => {
          if (bannerRef.current) {
            const rect = bannerRef.current.getBoundingClientRect();
            
            // Calculate the origin to be at the top edge of the banner
            const originX = (rect.left + rect.width / 2) / window.innerWidth;
            const originY = rect.top / window.innerHeight;
            
            confetti({
              ...confettiConfig,
              origin: { x: originX, y: originY }
            });
            
            // Clean up after 700ms
            setTimeout(() => {
              confetti.reset();
            }, 700);
          } else {
            // Fallback to center of viewport if banner not found
            confetti(confettiConfig);
          }
        }, delay);
      };
      
      // Trigger three bursts in sequence
      triggerBurst(0);    // First burst immediately
      triggerBurst(400);  // Second burst after 400ms
      triggerBurst(800);  // Third burst after 800ms
    }
  }, [isActive, prefersReducedMotion, isDevelopment]);
  
  return null; // This component doesn't render any visible elements
};
