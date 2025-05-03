
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
  
  // Trigger the confetti animation when isActive changes to true
  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      if (isDevelopment) {
        console.log("CheckInConfetti - Triggering confetti animation");
      }
      
      // Confetti configuration for more visible, firework-like confetti
      const confettiConfig = {
        particleCount: 25,       // More particles
        spread: 90,              // Wider spread
        startVelocity: 40,       // Faster initial velocity
        gravity: 0.7,            // Slightly slower fall
        colors: ['#8C7AE6', '#3CAEA3', '#FF6F61', '#FFD166'], // Vibrant colors
        origin: { y: 0, x: 0.5 }, // default origin (will be updated)
        scalar: 1.5,             // Larger pieces for better visibility
        shapes: ['square'],      // Just squares for better visibility
        ticks: 150,              // Longer confetti life
        disableForReducedMotion: true
      };
      
      // Set up just 2 bursts
      const triggerBurst = (delay: number, velocity: number) => {
        setTimeout(() => {
          if (bannerRef.current) {
            const rect = bannerRef.current.getBoundingClientRect();
            
            // Calculate the origin to be at the top edge of the banner
            const originX = (rect.left + rect.width / 2) / window.innerWidth;
            const originY = rect.top / window.innerHeight;
            
            confetti({
              ...confettiConfig,
              startVelocity: velocity, // Use the specific velocity for this burst
              origin: { x: originX, y: originY }
            });
            
            // Clean up after 1.5s
            setTimeout(() => {
              confetti.reset();
            }, 1500);
          } else {
            // Fallback to center of viewport if banner not found
            confetti({
              ...confettiConfig,
              startVelocity: velocity
            });
          }
        }, delay);
      };
      
      // Trigger just two bursts with different velocities
      triggerBurst(0, 40);    // First burst immediately - faster
      triggerBurst(600, 25);  // Second burst after 600ms - slower
    }
  }, [isActive, prefersReducedMotion, isDevelopment]);
  
  return null; // This component doesn't render any visible elements
};
