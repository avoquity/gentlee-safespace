
import React from 'react';
import { motion } from 'framer-motion';

const BackgroundArt = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Top left corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[5%] left-0 w-[30%]"
      >
        <svg width="100%" height="120" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract shapes */}
          <circle cx="50" cy="50" r="15" fill="#D9C7B8" opacity="0.6" />
          <path d="M80 30 Q120 10 150 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
          <path d="M20 70 C60 50, 100 90, 140 70" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.45" fill="none" />
          <path d="M100 20 L130 40" stroke="#D98C8C" strokeWidth="1.5" opacity="0.5" />
          <path d="M70 90 Q100 70 130 90" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
        </svg>
      </motion.div>

      {/* Top right corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute top-[8%] right-0 w-[25%]"
      >
        <svg width="100%" height="100" viewBox="0 0 250 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract shapes */}
          <path d="M30 60 C70 20, 120 80, 170 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
          <circle cx="180" cy="30" r="12" fill="#D9C7B8" opacity="0.6" />
          <path d="M50 80 L100 70" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" />
          <path d="M150 20 Q180 50 210 30" stroke="#D98C8C" strokeWidth="1.5" opacity="0.4" fill="none" />
        </svg>
      </motion.div>

      {/* Top section art (center) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[15%] left-0 w-full"
      >
        <div className="relative max-w-6xl mx-auto">
          <svg width="100%" height="100" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Abstract circle */}
            <circle cx="850" cy="50" r="20" fill="#D9C7B8" opacity="0.65" />
            
            {/* Wavy line */}
            <path d="M0 80 C100 50, 200 90, 300 70 C400 50, 500 80, 600 60 C700 40, 800 70, 1000 60" 
                  stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" />
            
            {/* Simple leaf */}
            <path d="M150 70 C170 40, 200 30, 180 70" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.45" fill="none" />
            <path d="M180 70 C160 40, 195 40, 180 70" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.45" fill="none" />
            
            {/* Additional decorative elements */}
            <circle cx="500" cy="30" r="10" fill="#FEF7CD" opacity="0.7" />
            <path d="M400 20 L450 40" stroke="#D98C8C" strokeWidth="1.5" opacity="0.5" />
            <path d="M700 40 Q750 20 800 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
          </svg>
        </div>
      </motion.div>

      {/* Upper-middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute top-[30%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="80" viewBox="0 0 1000 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Left side elements */}
            <path d="M50 40 C100 20, 150 60, 200 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" fill="none" />
            <circle cx="100" cy="30" r="8" fill="#D98C8C" opacity="0.5" />
            
            {/* Right side elements */}
            <path d="M800 50 Q850 20 900 50" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
            <circle cx="850" cy="40" r="12" fill="#D9C7B8" opacity="0.55" />
            
            {/* Center minimalist shape */}
            <path d="M450 20 L500 60 L550 20" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.3" fill="none" />
          </svg>
        </div>
      </motion.div>

      {/* Middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.4 }}
        className="absolute top-[45%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="100" viewBox="0 0 1000 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Abstract hills */}
            <path d="M0 60 Q250 20 500 60 T1000 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.3" fill="none" />
            
            {/* Simple plant */}
            <path d="M700 60 C700 30, 700 20, 680 20" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
            <path d="M700 40 C700 30, 720 20, 730 10" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
            
            {/* Small circle */}
            <circle cx="200" cy="30" r="10" fill="#D9C7B8" opacity="0.6" />
            
            {/* Additional elements */}
            <path d="M300 70 Q350 40 400 70" stroke="#D98C8C" strokeWidth="1.5" opacity="0.45" fill="none" />
            <circle cx="500" cy="50" r="15" fill="#FEF7CD" opacity="0.5" />
            <path d="M850 20 L900 50" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>
      </motion.div>

      {/* Lower-middle section art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute top-[65%] left-0 w-full"
      >
        <div className="relative max-w-6xl mx-auto">
          <svg width="100%" height="90" viewBox="0 0 1000 90" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Left side decorative elements */}
            <path d="M50 40 Q100 20 150 40" stroke="#D98C8C" strokeWidth="1.5" opacity="0.5" fill="none" />
            <circle cx="100" cy="60" r="8" fill="#FEF7CD" opacity="0.6" />
            
            {/* Center abstract shape */}
            <path d="M400 30 C500 10, 600 50, 700 30" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
            <circle cx="550" cy="40" r="12" fill="#D9C7B8" opacity="0.55" />
            
            {/* Right side minimal lines */}
            <path d="M800 50 L850 20" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" />
            <path d="M880 40 L930 40" stroke="#D98C8C" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>
      </motion.div>

      {/* Bottom left corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.6 }}
        className="absolute bottom-[10%] left-0 w-[30%]"
      >
        <svg width="100%" height="100" viewBox="0 0 300 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract shapes */}
          <circle cx="70" cy="30" r="15" fill="#D9C7B8" opacity="0.6" />
          <path d="M30 60 Q80 40 130 60" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.45" fill="none" />
          <path d="M150 20 L200 50" stroke="#D98C8C" strokeWidth="1.5" opacity="0.5" />
          <circle cx="180" cy="70" r="8" fill="#FEF7CD" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Bottom right corner art */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5, delay: 0.7 }}
        className="absolute bottom-[5%] right-0 w-[25%]"
      >
        <svg width="100%" height="120" viewBox="0 0 250 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Abstract shapes */}
          <path d="M20 40 C60 20, 100 60, 140 40" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
          <circle cx="170" cy="50" r="12" fill="#D9C7B8" opacity="0.55" />
          <path d="M100 80 L150 60" stroke="#D98C8C" strokeWidth="1.5" opacity="0.5" />
          <path d="M180 30 Q210 50 240 30" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
        </svg>
      </motion.div>

      {/* Bottom section art (center) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute bottom-[2%] left-0 w-full"
      >
        <div className="relative max-w-7xl mx-auto">
          <svg width="100%" height="120" viewBox="0 0 1000 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Gentle curve */}
            <path d="M0 100 Q500 80 1000 100" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" fill="none" />
            
            {/* Abstract shape */}
            <path d="M820 100 C840 70, 880 70, 900 100" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
            
            {/* Small hill with plant */}
            <path d="M200 100 Q300 60 400 100" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.35" fill="none" />
            <path d="M300 60 C300 40, 300 30, 320 20" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
            
            {/* Additional decorative elements */}
            <circle cx="600" cy="60" r="12" fill="#FEF7CD" opacity="0.6" />
            <path d="M500 40 L550 70" stroke="#D98C8C" strokeWidth="1.5" opacity="0.5" />
            <path d="M700 80 Q750 60 800 80" stroke="#2E2E2E" strokeWidth="1.5" opacity="0.4" fill="none" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
};

export default BackgroundArt;
