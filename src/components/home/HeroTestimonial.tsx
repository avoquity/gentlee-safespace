
import React from 'react';
import { motion } from 'framer-motion';

const HeroTestimonial = () => {
  return (
    <div className="w-full max-w-[95rem] mx-auto my-16 px-1 sm:px-2">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center"
      >
        {/* Badge added above hero banner */}
        <div className="flex justify-center mb-8">
          <a href="https://www.uneed.best/tool/gentlee" target="_blank" rel="noopener noreferrer">
            <img src="https://www.uneed.best/POTW2.png" style={{width: "250px"}} alt="Uneed POTW2 Badge" />
          </a>
        </div>
        
        <div className="bg-white bg-opacity-50 inline-block px-4 py-1.5 rounded-full mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-dark-accent/70">
            From Our Community
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          <p className="text-3xl sm:text-4xl md:text-5xl font-medium text-deep-charcoal leading-tight sm:leading-tight md:leading-tight mb-6 font-playfair">
            <span className="relative inline-block">
              "I just started crying. I didn't know I had so much {' '}
              <span className="relative inline-block">
                <span className="bg-soft-yellow bg-opacity-30 absolute inset-0 rounded-lg transform -rotate-1"></span>
                <span className="relative">emotions buried </span> 
              </span>
            </span>
            inside."
          </p>
          
          <div className="flex items-center justify-center mt-4">
            <p className="text-dark-accent/80 font-medium">
              — Rachel M., mother of three
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroTestimonial;
