
import React from 'react';
import { motion } from 'framer-motion';

const QuoteRotator = () => {
  return (
    <div className="w-full flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-[12rem] md:min-h-[16rem] lg:min-h-[20rem] flex items-center"
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-medium text-deep-charcoal leading-tight text-center">
          Imagine being understood the way you understand
        </h1>
      </motion.div>
    </div>
  );
};

export default QuoteRotator;
