
import React from 'react';
import { motion } from 'framer-motion';

const BackgroundArt = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Top left corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.8 }}
        className="absolute top-[5%] left-0 w-[30%]"
      >
        <svg width="100%" height="120" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="15" fill="#D9C7B8" opacity="0.5" />
          <path d="M20 70 C60 50, 100 90, 140 70 C180 50, 220 80, 260 60" stroke="#2E2E2E" strokeWidth="1" opacity="0.35" fill="none" />
        </svg>
      </motion.div>

      {/* Top right corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.8, delay: 0.2 }}
        className="absolute top-[8%] right-0 w-[25%]"
      >
        <svg width="100%" height="100" viewBox="0 0 250 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M30 60 C70 30, 120 60, 170 40 C220 20, 230 50, 240 30" stroke="#2E2E2E" strokeWidth="1" opacity="0.35" fill="none" />
          <circle cx="180" cy="30" r="12" fill="#D9C7B8" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Top section art (center) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ duration: 1.8 }}
        className="absolute top-[15%] left-0 w-full"
      >
        <div className="relative max-w-6xl mx-auto">
          <svg width="100%" height="100" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <circle cx="850" cy="50" r="20" fill="#D9C7B8" opacity="0.5" />
            <path d="M0 80 C250 50, 500 90, 750 50 C900 30, 950 60, 1000 40" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
            <circle cx="500" cy="30" r="10" fill="#FEF7CD" opacity="0.5" />
          </svg>
        </div>
      </motion.div>

      {/* Upper-middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.8, delay: 0.3 }}
        className="absolute top-[30%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="80" viewBox="0 0 1000 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M50 40 C100 20, 150 60, 300 40 C450 20, 550 60, 700 40 C850 20, 900 60, 950 40" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
            <circle cx="100" cy="30" r="8" fill="#D98C8C" opacity="0.45" />
            <circle cx="850" cy="40" r="12" fill="#D9C7B8" opacity="0.45" />
          </svg>
        </div>
      </motion.div>

      {/* Middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.8, delay: 0.4 }}
        className="absolute top-[45%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="100" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60 C250 30, 500 70, 750 40 C875 25, 925 50, 1000 30" stroke="#2E2E2E" strokeWidth="1" opacity="0.25" fill="none" />
            <path d="M700 60 C700 40, 700 30, 680 20" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
            <circle cx="200" cy="30" r="10" fill="#D9C7B8" opacity="0.5" />
            <circle cx="500" cy="50" r="15" fill="#FEF7CD" opacity="0.4" />
          </svg>
        </div>
      </motion.div>

      {/* Lower-middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ duration: 1.8, delay: 0.5 }}
        className="absolute top-[65%] left-0 w-full"
      >
        <div className="relative max-w-6xl mx-auto">
          <svg width="100%" height="90" viewBox="0 0 1000 90" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M50 40 C150 20, 250 60, 350 40 C450 20, 550 60, 650 40 C750 20, 850 60, 950 40" stroke="#D98C8C" strokeWidth="1" opacity="0.35" fill="none" />
            <circle cx="100" cy="60" r="8" fill="#FEF7CD" opacity="0.45" />
            <circle cx="550" cy="40" r="12" fill="#D9C7B8" opacity="0.45" />
          </svg>
        </div>
      </motion.div>

      {/* Bottom left corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.8, delay: 0.6 }}
        className="absolute bottom-[10%] left-0 w-[30%]"
      >
        <svg width="100%" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="30" r="15" fill="#D9C7B8" opacity="0.5" />
          <path d="M30 60 C80 40, 130 60, 180 40 C230 20, 260 40, 290 30" stroke="#2E2E2E" strokeWidth="1" opacity="0.35" fill="none" />
        </svg>
      </motion.div>

      {/* Bottom right corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 1.8, delay: 0.7 }}
        className="absolute bottom-[5%] right-0 w-[25%]"
      >
        <svg width="100%" height="120" viewBox="0 0 250 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 40 C60 20, 100 60, 140 40 C180 20, 220 60, 240 30" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
          <circle cx="170" cy="50" r="12" fill="#D9C7B8" opacity="0.45" />
        </svg>
      </motion.div>

      {/* Bottom section art (center) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.65 }}
        transition={{ duration: 1.8, delay: 0.8 }}
        className="absolute bottom-[2%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="120" viewBox="0 0 1000 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 100 C250 80, 500 90, 750 80 C875 75, 925 90, 1000 70" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
            <path d="M300 60 C300 40, 300 30, 320 20" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
            <circle cx="600" cy="60" r="12" fill="#FEF7CD" opacity="0.5" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default BackgroundArt;
