
import React from 'react';
import { motion } from 'framer-motion';

const BackgroundArt = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Top section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[15%] left-0 w-full"
      >
        <div className="relative max-w-6xl mx-auto">
          <svg width="100%" height="100" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Abstract circle */}
            <circle cx="850" cy="50" r="20" fill="#D9C7B8" opacity="0.5" />
            
            {/* Wavy line */}
            <path d="M0 80 C100 50, 200 90, 300 70 C400 50, 500 80, 600 60 C700 40, 800 70, 1000 60" 
                  stroke="#2E2E2E" strokeWidth="1" opacity="0.2" />
            
            {/* Simple leaf */}
            <path d="M150 70 C170 40, 200 30, 180 70" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
            <path d="M180 70 C160 40, 195 40, 180 70" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
          </svg>
        </div>
      </motion.div>

      {/* Middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-[45%] left-0 w-full hidden md:block"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="80" viewBox="0 0 1000 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Abstract hills */}
            <path d="M0 60 Q250 20 500 60 T1000 40" stroke="#2E2E2E" strokeWidth="1" opacity="0.15" fill="none" />
            
            {/* Simple plant */}
            <path d="M700 60 C700 30, 700 20, 680 20" stroke="#2E2E2E" strokeWidth="1" opacity="0.25" fill="none" />
            <path d="M700 40 C700 30, 720 20, 730 10" stroke="#2E2E2E" strokeWidth="1" opacity="0.25" fill="none" />
            
            {/* Small circle */}
            <circle cx="200" cy="30" r="8" fill="#D9C7B8" opacity="0.4" />
          </svg>
        </div>
      </motion.div>

      {/* Bottom section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="absolute bottom-0 left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="120" viewBox="0 0 1000 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Gentle curve */}
            <path d="M0 100 Q500 80 1000 100" stroke="#2E2E2E" strokeWidth="1" opacity="0.2" fill="none" />
            
            {/* Abstract shape */}
            <path d="M820 100 C840 70, 880 70, 900 100" stroke="#2E2E2E" strokeWidth="1" opacity="0.25" fill="none" />
            
            {/* Small hill with plant */}
            <path d="M200 100 Q300 60 400 100" stroke="#2E2E2E" strokeWidth="1" opacity="0.2" fill="none" />
            <path d="M300 60 C300 40, 300 30, 320 20" stroke="#2E2E2E" strokeWidth="1" opacity="0.25" fill="none" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default BackgroundArt;
