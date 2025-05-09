
import React from 'react';
import { motion } from 'framer-motion';

const FAQSection = () => {
  return (
    <div className="w-full max-w-[95rem] mx-auto py-16 px-1 sm:px-2">
      <div className="text-center">
        <div className="bg-white bg-opacity-50 inline-block px-4 py-1.5 rounded-full mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-dark-accent/70">
            Clear answers
          </p>
        </div>
        
        <h2 className="text-3xl sm:text-4xl mb-12 text-deep-charcoal font-playfair">
          Your questions - Our answers
        </h2>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-left"
          >
            <h3 className="text-xl font-medium text-deep-charcoal mb-2 font-playfair">
              Is Gentlee a replacement for therapy?
            </h3>
            <p className="text-deep-charcoal/80 font-montserrat">
              No, Gentlee is designed to be a supportive tool for self-reflection and emotional exploration, not a replacement for professional therapy. It can help you gain insights and manage your feelings, but it's important to seek guidance from a licensed therapist or healthcare provider for mental health concerns or crises.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-left"
          >
            <h3 className="text-xl font-medium text-deep-charcoal mb-2 font-playfair">
              How does Gentlee ensure my privacy?
            </h3>
            <p className="text-deep-charcoal/80 font-montserrat">
              We prioritize your privacy and data security. Gentlee uses encryption to protect your conversations, and we adhere to strict data protection policies. Your data is never shared with third parties without your explicit consent.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-left"
          >
            <h3 className="text-xl font-medium text-deep-charcoal mb-2 font-playfair">
              Can Gentlee help with anxiety or stress?
            </h3>
            <p className="text-deep-charcoal/80 font-montserrat">
              Gentlee can be a valuable tool for managing anxiety and stress by providing a space to express your thoughts and feelings. It can help you identify triggers and develop coping strategies. However, it is not a substitute for professional treatment for anxiety disorders.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-left"
          >
            <h3 className="text-xl font-medium text-deep-charcoal mb-2 font-playfair">
              Is my data stored?
            </h3>
            <p className="text-deep-charcoal/80 font-montserrat">
              Yes, your data is stored to provide you with a continuous and personalized experience. We retain your conversation history so you can track your progress and insights over time. You have the option to delete your data at any time.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
