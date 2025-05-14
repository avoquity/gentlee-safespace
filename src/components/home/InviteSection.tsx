
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface InviteSectionProps {
  scrollToInput: () => void;
}

const InviteSection = ({ scrollToInput }: InviteSectionProps) => {
  return (
    <div className="w-full max-w-[95rem] mx-auto py-16 px-4 sm:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-soft-ivory rounded-xl p-8 sm:p-12 md:p-16 text-center flex flex-col items-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl mb-4 text-deep-charcoal font-playfair font-medium px-4 sm:px-8 md:px-16 mx-auto">
          When the world isn't gentle, let us be.
        </h2>
        
        <p className="text-lg sm:text-xl text-deep-charcoal/80 font-montserrat mb-10 max-w-2xl mx-auto">
          Slip into a quiet chat—free, private, and here whenever you need a softer moment.
        </p>
        
        <motion.button
          onClick={scrollToInput}
          whileTap={{ scale: 0.98 }}
          className="bg-dark-accent hover:bg-dark-accent/90 text-white px-8 py-4 rounded-full transition-colors flex items-center gap-2 text-lg mb-6"
        >
          <span>Start chatting</span>
          <ArrowRight className="w-5 h-5" />
        </motion.button>
        
        <p className="text-xs text-deep-charcoal/60 font-montserrat">
          Takes 10 sec • No card needed • Private & encrypted
        </p>
      </motion.div>
    </div>
  );
};

export default InviteSection;
