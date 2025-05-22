
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface GentleeExamplesProps {
  scrollToInput: () => void;
}

const ChatBubble = ({ isUser, children }: { isUser: boolean; children: React.ReactNode }) => {
  return (
    <div className={`${isUser ? 'ml-auto text-right' : 'mr-auto'} w-full md:max-w-[85%] mb-3`}>
      <div 
        className={`inline-block px-4 py-3 rounded-[14px] text-left
        ${isUser 
          ? 'bg-white text-[#333]' 
          : 'bg-white text-[#234] border border-[#BBD1C5] shadow-[inset_0px_0px_2px_rgba(0,0,0,0.1)]'}`}
        style={{ 
          fontSize: 'clamp(15px, 4vw, 17px)', 
          lineHeight: 1.45 
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Typing indicator component with three animated dots
const TypingIndicator = () => {
  return (
    <div className="flex space-x-1 px-4 py-3 rounded-[14px] bg-white text-[#234] border border-[#BBD1C5] shadow-[inset_0px_0px_2px_rgba(0,0,0,0.1)] inline-block mb-3">
      <motion.span 
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatType: "loop" }}
      />
      <motion.span 
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, delay: 0.2, repeat: Infinity, repeatType: "loop" }}
      />
      <motion.span 
        className="w-2 h-2 bg-gray-600 rounded-full"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.6, delay: 0.4, repeat: Infinity, repeatType: "loop" }}
      />
    </div>
  );
};

const GentleeExamples = ({
  scrollToInput
}: GentleeExamplesProps) => {
  const [showTyping, setShowTyping] = useState(false);
  const [showSecondResponse, setShowSecondResponse] = useState(false);

  // Show typing indicator and then second response on initial load
  useEffect(() => {
    const typingTimer = setTimeout(() => {
      setShowTyping(true);
    }, 1000);
    
    const responseTimer = setTimeout(() => {
      setShowTyping(false);
      setShowSecondResponse(true);
    }, 2500); // Show typing for 1.5s after it appears
    
    return () => {
      clearTimeout(typingTimer);
      clearTimeout(responseTimer);
    };
  }, []);
  
  return (
    <div className="w-full max-w-[95rem] mx-auto py-16 px-1 sm:px-2">
      <div className="text-center">
        {/* "Gentlee moments" badge above title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-soft-ivory">
            <p className="text-xs font-medium uppercase tracking-wider text-dark-accent/70">
              Gentlee moments
            </p>
          </div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl mb-6 text-deep-charcoal font-playfair font-medium px-4 md:px-8 lg:px-16 mx-auto"
        >
          I just want to talk, not seek the answers of the universe.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-deep-charcoal/80 font-montserrat mb-12 max-w-3xl mx-auto"
        >
          We often don't need advice. We just need a safe space for our thoughts so we can process them, and reconnect with our inner world.
        </motion.p>
        
        {/* Chat bubbles replacing the carousel */}
        <div className="max-w-2xl mx-auto mb-12 px-4">
          <div className="bg-warm-beige/30 rounded-lg p-6 shadow-sm">
            <ChatBubble isUser={true}>
              Everything feels noisy today, and I'm tired of pretending I'm okay.
            </ChatBubble>
            
            <ChatBubble isUser={false}>
              It's hard carrying that much sound inside—like every thought is talking over the next.
            </ChatBubble>
            
            {showTyping && <div className="mr-auto"><TypingIndicator /></div>}
            
            {showSecondResponse && (
              <ChatBubble isUser={false}>
                Let's turn the volume down for a moment. If one true voice could rise above the chatter, what might it whisper?
              </ChatBubble>
            )}
          </div>
        </div>
        
        {/* Button with flatter height */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="-mt-10" // Raised 40px closer to chat
        >
          <Button 
            onClick={scrollToInput} 
            className="bg-dark-accent hover:bg-dark-accent/90 text-white px-8 py-4 h-auto text-lg rounded-full transition-colors shadow-sm"
          >
            Start your free chat
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default GentleeExamples;
