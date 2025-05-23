
import React from 'react';
import TestimonialCard from './TestimonialCard';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

const testimonials = [
  {
    quote: "I'd be on Reddit at 2 a.m. hoping someone would just listen. Gentlee did that instantly—and reflected my own words back so I could breathe again.",
    name: "Luis G., 27",
    position: "graduate student"
  },
  {
    quote: "Notifications from other 'wellness' apps stressed me out more than my job. Gentlee waits quietly until I reach out, then dissolves the mental noise in minutes.",
    name: "Isha K., 35",
    position: "fintech analyst"
  },
  {
    quote: "I'm budgeting every dollar right now; weekly therapy wasn't possible. Gentlee costs less than a single session and still unclenched the self-doubt I'd been carrying for years.",
    name: "Marcus T., 29",
    position: "freelance videographer"
  },
  {
    quote: "Friends love to give advice—Gentlee just lets me feel first. By the end of each chat the heaviness is gone and the insight is mine, not somebody else's lecture.",
    name: "Jenna P., 38",
    position: "primary-school teacher"
  },
  {
    quote: "I used to rip up my paper journals so no one would read them. Gentlee's ephemerality means the raw mess disappears, leaving only the calm summary I actually need.",
    name: "Noah L., 24",
    position: "UX intern"
  },
  {
    quote: "Burnout made every self-help tip feel like another to-do. Gentlee reframed my spiral in three sentences—pain gone, priorities clear.",
    name: "Carmen S., 41",
    position: "hospital nurse"
  },
  {
    quote: "Meditation apps told me to 'just breathe.' Gentlee showed me why I was holding my breath. That single insight broke a months-long anxiety loop.",
    name: "Ethan R., 33",
    position: "startup co-founder"
  }
];

const TestimonialGrid = () => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-[95rem] mx-auto mt-6 mb-16 px-6 sm:px-12 md:px-[120px]"
    >
      <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-2' : ''} gap-6 md:gap-8 lg:gap-10`}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            quote={testimonial.quote}
            name={testimonial.name}
            position={testimonial.position}
            delay={0.1 * index}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TestimonialGrid;
