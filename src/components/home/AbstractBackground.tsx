
import React from 'react';
import { motion } from 'framer-motion';

const AbstractBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gentle curved line 1 - resembling wind */}
      <motion.svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="absolute opacity-[0.15]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 2 }}
      >
        <motion.path
          d="M-100,400 C300,350 600,650 900,550 C1200,450 1500,650 1800,500 C2100,350 2400,480 2700,400"
          stroke="#A8BFA5" 
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          fill="none"
        />
      </motion.svg>
      
      {/* Gentle curved line 2 - resembling nature flow */}
      <motion.svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="absolute opacity-[0.12]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.12 }}
        transition={{ duration: 2 }}
      >
        <motion.path
          d="M-200,600 C100,680 400,500 700,580 C1000,660 1300,540 1600,620 C1900,700 2200,580 2500,650"
          stroke="#D98C8C" 
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3.5, ease: "easeInOut", delay: 0.5 }}
          fill="none"
        />
      </motion.svg>
      
      {/* Gentle leafy pattern - resembling nature elements */}
      <motion.svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 1920 1080" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="absolute opacity-[0.08]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 2 }}
      >
        <motion.path
          d="M100,200 C200,150 250,300 200,350 C150,400 50,350 100,200"
          stroke="#A8BFA5" 
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          fill="none"
        />
        
        <motion.path
          d="M1700,750 C1800,700 1850,850 1800,900 C1750,950 1650,900 1700,750"
          stroke="#A8BFA5" 
          strokeWidth="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          fill="none"
        />
      </motion.svg>
      
      {/* Floating soft dots - resembling gentle breeze particles */}
      <div className="absolute w-full h-full">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-deep-charcoal/5"
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: Math.random() * 100 + "%",
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5
            }}
            animate={{
              x: [
                Math.random() * 100 - 50 + "%", 
                Math.random() * 100 - 50 + "%",
                Math.random() * 100 - 50 + "%"
              ],
              y: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
                Math.random() * 100 + "%"
              ]
            }}
            transition={{
              duration: Math.random() * 50 + 30,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AbstractBackground;
