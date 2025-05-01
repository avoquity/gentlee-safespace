
import React from 'react';
import { motion } from 'framer-motion';

interface CheckInConfettiProps {
  isActive: boolean;
  prefersReducedMotion: boolean;
}

// Confetti shapes and colors
const confettiItems = [
  // Circles and rectangles in brand pastel palette
  { type: 'circle', color: '#E8E6F5', size: 8, x: '10%', y: '20%', delay: 0 },
  { type: 'circle', color: '#D7EADA', size: 10, x: '20%', y: '30%', delay: 0.1 },
  { type: 'rect', color: '#FCEFE3', width: 8, height: 12, x: '30%', y: '15%', delay: 0.05 },
  { type: 'circle', color: '#E8E6F5', size: 12, x: '40%', y: '25%', delay: 0.15 },
  { type: 'rect', color: '#D7EADA', width: 10, height: 10, x: '50%', y: '10%', delay: 0.2 },
  { type: 'circle', color: '#FCEFE3', size: 9, x: '60%', y: '20%', delay: 0.1 },
  { type: 'rect', color: '#E8E6F5', width: 7, height: 14, x: '70%', y: '30%', delay: 0.15 },
  { type: 'circle', color: '#D7EADA', size: 11, x: '80%', y: '15%', delay: 0.05 },
  { type: 'rect', color: '#FCEFE3', width: 9, height: 9, x: '90%', y: '25%', delay: 0.2 }
];

export const CheckInConfetti: React.FC<CheckInConfettiProps> = ({ isActive, prefersReducedMotion }) => {
  if (prefersReducedMotion || !isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {confettiItems.map((item, index) => {
        const key = `confetti-${index}`;
        
        // Common animation properties
        const animate = {
          y: [0, 20],
          opacity: [0, 1, 0],
          transition: {
            duration: 0.4,
            ease: "easeOut",
            delay: item.delay,
          }
        };
        
        if (item.type === 'circle') {
          return (
            <motion.div
              key={key}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: item.size,
                height: item.size,
                borderRadius: '50%',
                backgroundColor: item.color,
                opacity: 0
              }}
              animate={animate}
            />
          );
        } else {
          return (
            <motion.div
              key={key}
              style={{
                position: 'absolute',
                left: item.x,
                top: item.y,
                width: (item as any).width,
                height: (item as any).height,
                backgroundColor: item.color,
                opacity: 0
              }}
              animate={animate}
            />
          );
        }
      })}
    </div>
  );
};
