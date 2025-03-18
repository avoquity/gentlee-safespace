
import React from 'react';
import Header from '../components/Header';
import QuoteRotator from '../components/QuoteRotator';
import MusicPlayer from '../components/MusicPlayer';
import WritingInput from '../components/WritingInput';
import Footer from '../components/Footer';
import FAQSection from '../components/PromoSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        <div className="pt-40 max-w-7xl mx-auto w-full">
          <div className="space-y-16">
            <div className="animate-fade-in">
              <QuoteRotator />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-end">
              <div className="space-y-16 animate-fade-in">
                <p className="text-xl text-deep-charcoal/80 font-poppins">
                  Your space to untangle your thoughts and find clarity through just chats. No rules, no pressure—just a space to let your thoughts breathe.
                </p>
                
                <div className="animate-fade-up">
                  <WritingInput />
                </div>
              </div>
              
              <div className="flex justify-end animate-fade-up">
                <div className="max-w-md w-full">
                  <MusicPlayer />
                </div>
              </div>
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
