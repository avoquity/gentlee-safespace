
import React from 'react';
import Header from '../components/Header';
import QuoteRotator from '../components/QuoteRotator';
import WritingInput from '../components/WritingInput';
import Footer from '../components/Footer';
import FAQSection from '../components/PromoSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        <div className="pt-40 max-w-7xl mx-auto w-full">
          <div className="space-y-8">
            <div className="flex flex-col items-center animate-fade-in">
              <QuoteRotator />
            </div>
            
            <div className="flex flex-col items-center">
              <div className="space-y-10 animate-fade-in max-w-2xl text-center">
                <p className="text-xl text-deep-charcoal/80 font-poppins">
                  Finally, a place to talk it out—no streaks, no fixes, just gentle clarity.
                </p>
                
                <div className="animate-fade-up w-full">
                  <WritingInput />
                </div>
              </div>
            </div>
            
            <div className="animate-fade-up mt-8">
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
