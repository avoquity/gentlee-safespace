
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  quote: string;
  name: string;
  position: string;
  delay?: number;
  className?: string;
}

const TestimonialCard = ({ 
  quote, 
  name, 
  position, 
  delay = 0,
  className 
}: TestimonialCardProps) => {
  // Randomly choose between dusty-rose and soft-yellow for hover state
  // The randomization happens on component mount, not on every hover
  const hoverColor = React.useMemo(() => {
    return Math.random() > 0.5 ? 'hover:bg-dusty-rose/40' : 'hover:bg-soft-yellow/40';
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-soft-ivory p-6 rounded-lg shadow-sm border border-dark-accent/5 flex flex-col h-full transition-all duration-300",
        hoverColor,
        "hover:shadow-md", 
        className
      )}
    >
      <p className="text-lg font-normal text-deep-charcoal/80 mb-6 flex-grow font-montserrat">
        "{quote}"
      </p>
      <div className="mt-auto">
        <p className="text-deep-charcoal/90 font-medium">
          — {name} •{' '}
          <span className="text-deep-charcoal/70">
            {position}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
