
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface CheckInConfettiProps {
  isActive: boolean;
  prefersReducedMotion: boolean;
}

// Confetti shapes and colors in brand pastel palette
const confettiItems = [
  // Circles and rectangles in brand pastel palette
  { type: 'circle', color: '#E8E6F5', size: 12, x: '10%', y: '20%', delay: 0 },
  { type: 'circle', color: '#D7EADA', size: 14, x: '20%', y: '30%', delay: 0.1 },
  { type: 'rect', color: '#FCEFE3', width: 10, height: 16, x: '30%', y: '15%', delay: 0.05 },
  { type: 'circle', color: '#E8E6F5', size: 16, x: '40%', y: '25%', delay: 0.15 },
  { type: 'rect', color: '#D7EADA', width: 14, height: 14, x: '50%', y: '10%', delay: 0.2 },
  { type: 'circle', color: '#FCEFE3', size: 13, x: '60%', y: '20%', delay: 0.1 },
  { type: 'rect', color: '#E8E6F5', width: 10, height: 18, x: '70%', y: '30%', delay: 0.15 },
  { type: 'circle', color: '#D7EADA', size: 15, x: '80%', y: '15%', delay: 0.05 },
  { type: 'rect', color: '#FCEFE3', width: 12, height: 12, x: '90%', y: '25%', delay: 0.2 }
];

export const CheckInConfetti: React.FC<CheckInConfettiProps> = ({ isActive, prefersReducedMotion }) => {
  // Development mode debugging
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Trigger canvas confetti when isActive changes to true
  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      console.log("CheckInConfetti - Triggering canvas confetti animation");
      
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E8E6F5', '#D7EADA', '#FCEFE3']
        });
      }, 100);
    }
  }, [isActive, prefersReducedMotion]);

  useEffect(() => {
    // Debug log to verify the component is receiving the correct props
    if (isDevelopment) {
      console.log("CheckInConfetti rendered with isActive:", isActive);
    }
  }, [isActive, isDevelopment]);

  if (prefersReducedMotion || !isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10" aria-hidden="true">
      {confettiItems.map((item, index) => {
        const key = `confetti-${index}`;
        
        // Enhanced animation properties for better visibility
        const animate = {
          y: [-20, 60],
          x: [(Math.random() * 10) - 5, (Math.random() * 20) - 10],
          opacity: [0, 1, 0],
          scale: [0.8, 1.2, 0.8],
          rotate: [0, Math.random() * 360]
        };
        
        const transition = {
          duration: 1.2,
          ease: "easeOut",
          delay: item.delay,
        };
        
        if (item.type === 'circle') {
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: -20 }}
              animate={animate}
              transition={transition}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: item.size,
                height: item.size,
                borderRadius: '50%',
                backgroundColor: item.color,
              }}
            />
          );
        } else {
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: -20 }}
              animate={animate}
              transition={transition}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: (item as any).width,
                height: (item as any).height,
                backgroundColor: item.color,
              }}
            />
          );
        }
      })}
    </div>
  );
};
