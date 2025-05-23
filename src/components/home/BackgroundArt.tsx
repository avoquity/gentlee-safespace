
import React from 'react';
import { motion } from 'framer-motion';

const BackgroundArt = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Top section art - enhanced */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[5%] left-0 w-full"
      >
        <div className="relative max-w-6xl mx-auto">
          <svg width="100%" height="180" viewBox="0 0 1000 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Abstract circles */}
            <circle cx="850" cy="50" r="20" fill="#D9C7B8" opacity="0.6" />
            <circle cx="150" cy="100" r="15" fill="#D98C8C" opacity="0.4" />
            <circle cx="700" cy="120" r="10" fill="#F5D76E" opacity="0.5" />
            
            {/* Wavy lines */}
            <path d="M0 80 C100 50, 200 90, 300 70 C400 50, 500 80, 600 60 C700 40, 800 70, 1000 60" 
                  stroke="#2E2E2E" strokeWidth="1.5" opacity="0.3" />
            <path d="M0 120 C150 100, 300 140, 450 110 C600 80, 750 130, 1000 100" 
                  stroke="#D98C8C" strokeWidth="1" opacity="0.4" />
            
            {/* Simple leaf elements */}
            <path d="M150 70 C170 40, 200 30, 180 70" stroke="#2E2E2E" strokeWidth="1.2" opacity="0.4" fill="none" />
            <path d="M180 70 C160 40, 195 40, 180 70" stroke="#2E2E2E" strokeWidth="1.2" opacity="0.4" fill="none" />
            
            {/* Additional minimalist elements */}
            <path d="M400 40 L450 40" stroke="#2E2E2E" strokeWidth="1.2" opacity="0.3" />
            <path d="M410 30 L410 50" stroke="#2E2E2E" strokeWidth="1.2" opacity="0.3" />
            <path d="M440 30 L440 50" stroke="#2E2E2E" strokeWidth="1.2" opacity="0.3" />
          </svg>
        </div>
      </motion.div>

      {/* New upper-middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute top-[25%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="120" viewBox="0 0 1000 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Abstract curved line */}
            <path d="M0 80 Q250 20 500 70 T1000 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.25" fill="none" />
            
            {/* Minimalist plant-like elements */}
            <path d="M100 90 C100 60, 100 50, 80 30" stroke="#D98C8C" strokeWidth="1.2" opacity="0.35" fill="none" />
            <path d="M100 70 C100 60, 120 40, 130 20" stroke="#D98C8C" strokeWidth="1.2" opacity="0.35" fill="none" />
            
            {/* Dotted pattern */}
            <circle cx="600" cy="30" r="3" fill="#2E2E2E" opacity="0.4" />
            <circle cx="620" cy="50" r="3" fill="#2E2E2E" opacity="0.4" />
            <circle cx="640" cy="30" r="3" fill="#2E2E2E" opacity="0.4" />
            <circle cx="660" cy="50" r="3" fill="#2E2E2E" opacity="0.4" />
            <circle cx="680" cy="30" r="3" fill="#2E2E2E" opacity="0.4" />
          </svg>
        </div>
      </motion.div>

      {/* Middle section art - enhanced */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-[45%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="150" viewBox="0 0 1000 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Abstract hills with more definition */}
            <path d="M0 60 Q250 20 500 60 T1000 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.25" fill="none" />
            <path d="M0 100 Q300 60 600 90 T1000 70" stroke="#D9C7B8" strokeWidth="1.2" opacity="0.3" fill="none" />
            
            {/* Simple plant elements - enhanced */}
            <path d="M700 60 C700 30, 700 20, 680 20" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" fill="none" />
            <path d="M700 40 C700 30, 720 20, 730 10" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" fill="none" />
            <path d="M300 120 C300 90, 300 80, 280 60" stroke="#D98C8C" strokeWidth="1.2" opacity="0.3" fill="none" />
            <path d="M300 100 C300 90, 320 70, 330 50" stroke="#D98C8C" strokeWidth="1.2" opacity="0.3" fill="none" />
            
            {/* Decorative circles */}
            <circle cx="200" cy="30" r="12" fill="#D9C7B8" opacity="0.5" />
            <circle cx="800" cy="80" r="10" fill="#FEF7CD" opacity="0.6" />
          </svg>
        </div>
      </motion.div>

      {/* Additional lower-middle section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        className="absolute top-[70%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="140" viewBox="0 0 1000 140" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Gentle abstract lines */}
            <path d="M50 70 Q200 20 350 60 T650 30 T1000 70" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.25" fill="none" />
            
            {/* Minimalist geometric shapes */}
            <rect x="150" y="80" width="30" height="30" stroke="#D98C8C" strokeWidth="1" opacity="0.4" fill="none" />
            <rect x="750" y="40" width="40" height="20" stroke="#2E2E2E" strokeWidth="1" opacity="0.3" fill="none" />
            
            {/* Connecting dots with lines */}
            <circle cx="400" cy="50" r="4" fill="#D9C7B8" opacity="0.6" />
            <circle cx="450" cy="70" r="4" fill="#D9C7B8" opacity="0.6" />
            <circle cx="500" cy="40" r="4" fill="#D9C7B8" opacity="0.6" />
            <path d="M400 50 L450 70 L500 40" stroke="#D9C7B8" strokeWidth="0.8" opacity="0.4" />
          </svg>
        </div>
      </motion.div>

      {/* Bottom section art - enhanced */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="absolute bottom-0 left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="180" viewBox="0 0 1000 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Gentle curves with increased definition */}
            <path d="M0 100 Q500 80 1000 100" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.3" fill="none" />
            <path d="M0 140 Q300 120 600 140 Q800 150 1000 130" stroke="#D98C8C" strokeWidth="1.2" opacity="0.25" fill="none" />
            
            {/* Abstract shapes - more defined */}
            <path d="M820 100 C840 70, 880 70, 900 100" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" fill="none" />
            <path d="M720 120 C740 90, 780 90, 800 120" stroke="#D9C7B8" strokeWidth="1.2" opacity="0.3" fill="none" />
            
            {/* Small hills with plants - enhanced */}
            <path d="M200 100 Q300 60 400 100" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.3" fill="none" />
            <path d="M300 60 C300 40, 300 30, 320 20" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" fill="none" />
            <path d="M500 120 Q600 80 700 120" stroke="#D9C7B8" strokeWidth="1.2" opacity="0.25" fill="none" />
            <path d="M600 80 C600 60, 600 50, 620 40" stroke="#D9C7B8" strokeWidth="1.2" opacity="0.3" fill="none" />
            
            {/* Decorative elements */}
            <circle cx="100" cy="80" r="15" fill="#FEF7CD" opacity="0.5" />
            <circle cx="900" cy="60" r="12" fill="#D9C7B8" opacity="0.4" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default BackgroundArt;
