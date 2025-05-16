import React from 'react';
import { motion } from 'framer-motion';
const QuoteRotator = () => {
  return <div className="w-full flex flex-col items-center justify-center py-[40px]">
      {/* New badge added above headline */}
      <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.4
    }}>
        <a href="https://www.uneed.best/tool/gentlee" target="_blank" rel="noopener noreferrer">
          <img src="https://www.uneed.best/POTD1.png" style={{
          width: "250px"
        }} alt="Uneed POTD1 Badge" />
        </a>
      </motion.div>
      
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6
    }} className="min-h-[6rem] md:min-h-[8rem] lg:min-h-[16rem] flex items-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-medium text-deep-charcoal leading-tight text-center">
          Imagine being understood the way you understand
        </h1>
      </motion.div>
    </div>;
};
export default QuoteRotator;