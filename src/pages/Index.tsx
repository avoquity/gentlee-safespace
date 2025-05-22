
import React, { useRef } from 'react';
import Header from '../components/Header';
import WritingInput from '../components/WritingInput';
import Footer from '../components/Footer';
import FAQSection from '../components/PromoSection';
import TestimonialGrid from '../components/home/TestimonialGrid';
import QuoteRotator from '../components/QuoteRotator';
import TopicTagsDisplay from '../components/home/TopicTagsDisplay';
import { motion } from 'framer-motion';
import HeroTestimonial from '../components/home/HeroTestimonial';
import GentleeExamples from '../components/home/GentleeExamples';
import InviteSection from '../components/home/InviteSection';

// Complete list of topics for the homepage
const suggestedTopics = [
  "Stress", "Anxiety & Overthinking", "Relationships", "Healing & Growth",
  "Burnout & Fatigue", "Loneliness", "Parenthood", "Motivation",
  "Money Worries", "Grief & Loss", "Friendships", "Purpose & Meaning",
  "Time & Balance", "Body Image", "Break-ups", "Confidence Boost",
  "Career Change", "Self-Compassion", "Identity & Belonging", "Building Habits",
  "Life Transitions", "Inner Clarity", "Forgiveness"
];

const Index = () => {
  const inputRef = useRef<HTMLDivElement>(null);
  
  const scrollToInput = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth' });
      // Focus the textarea in the WritingInput component
      const textarea = inputRef.current.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-warm-beige flex flex-col">
      <Header />
      
      <main className="flex-1 w-full mx-auto flex flex-col min-h-screen">
        <div className="pt-20 max-w-[95rem] mx-auto w-full px-1 sm:px-2">
          <div className="space-y-8">
            <QuoteRotator />
            
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-fade-in max-w-2xl text-center mb-8 px-2">
                <p className="text-xl text-deep-charcoal/80 font-montserrat">
                  A space where you can talk it out without judgment. No streaks, no metrics, no fixes—just a warm conversation that helps you understand what's really going on inside.
                </p>
              </div>
              
              <div ref={inputRef} className="animate-fade-up w-full max-w-2xl px-2">
                <WritingInput />
              </div>
            </div>
            
            <HeroTestimonial />
            
            {/* Testimonial Grid - moved to right below HeroTestimonial */}
            <div className="animate-fade-up">
              <TestimonialGrid />
            </div>
            
            {/* Gentlee Examples Section with topic tags above it */}
            <div className="relative">
              {/* Topic Tags now placed here as a separate component */}
              <div className="mb-8">
                <TopicTagsDisplay topics={suggestedTopics} />
              </div>
              <GentleeExamples scrollToInput={scrollToInput} />
            </div>
            
            <div className="animate-fade-up">
              <FAQSection />
            </div>
            
            {/* NEW: Final Invite Section */}
            <InviteSection scrollToInput={scrollToInput} />
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
