
import React from 'react';
import Header from '../components/Header';
import QuoteRotator from '../components/QuoteRotator';
import WritingInput from '../components/WritingInput';
import Footer from '../components/Footer';
import FAQSection from '../components/PromoSection';
import TestimonialGrid from '../components/home/TestimonialGrid';
import HeroTestimonial from '../components/home/HeroTestimonial';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-warm-beige flex flex-col">
      <Header />
      
      <main className="flex-1 w-full mx-auto flex flex-col min-h-screen">
        <div className="pt-40 max-w-[95rem] mx-auto w-full px-1 sm:px-2">
          <div className="space-y-8">
            <div className="flex flex-col items-center animate-fade-in">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl sm:text-6xl md:text-7xl font-medium text-deep-charcoal mb-6 font-playfair text-center leading-tight sm:leading-tight md:leading-tight"
              >
                Let's make sense of <br className="hidden sm:block" />your feelings, together
              </motion.h1>
              <QuoteRotator />
            </div>
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-fade-in max-w-2xl text-center mb-8 px-2">
                <p className="text-xl text-deep-charcoal/80 font-montserrat">
                  A space where you can talk it out without judgment. No streaks, no metrics, no fixes—just a warm conversation that helps you understand what's really going on inside.
                </p>
              </div>
              
              <div className="animate-fade-up w-full max-w-2xl px-2">
                <WritingInput />
              </div>
            </div>
            
            <HeroTestimonial />
            
            <div className="animate-fade-up">
              <TestimonialGrid />
            </div>
            
            <div className="animate-fade-up">
              <FAQSection />
            </div>
          </div>
        </div>
          
        <div className="mt-16 px-4 mb-8">
          <p className="text-xs text-deep-charcoal/60 text-center max-w-3xl mx-auto">
            Disclaimer: Gentlee is designed for reflection, self-exploration, and emotional support. It is not a substitute for professional therapy, counseling, or medical treatment. If you are in crisis or require professional mental health care, please seek guidance from a licensed therapist or healthcare provider. By using this platform, you acknowledge that Gentlee is for informational and personal growth purposes only and does not provide medical or psychological diagnoses, treatment, or advice.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
