
import React from 'react';
import { motion } from 'framer-motion';

const HeroTestimonial = () => {
  return (
    <div className="w-full max-w-7xl mx-auto my-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center"
      >
        <div className="bg-gray-100 inline-block px-4 py-1.5 rounded-full mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-deep-charcoal/70">
            Our Community
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          <p className="text-3xl sm:text-4xl md:text-5xl font-medium text-deep-charcoal leading-tight sm:leading-tight md:leading-tight mb-6">
            <span className="relative inline-block">
              Therapy homework overwhelmed me.{' '}
              <span className="relative inline-block">
                <span className="bg-soft-yellow bg-opacity-30 absolute inset-0 rounded-lg transform -rotate-1"></span>
                <span className="relative">Gentlee untied the knots</span>
              </span>
            </span>
            {' '}in my heart in five minutes. I could breathe again.
          </p>
          
          <div className="flex items-center justify-center mt-4">
            <p className="text-deep-charcoal/70 font-medium">
              Rachel M., 31, mum of three
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroTestimonial;
