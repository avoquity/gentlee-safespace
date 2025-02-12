
import React from 'react';
import Header from '../components/Header';
import QuoteRotator from '../components/QuoteRotator';
import MusicPlayer from '../components/MusicPlayer';
import WritingInput from '../components/WritingInput';

const Index = () => {
  return (
    <div className="min-h-screen bg-soft-ivory">
      <Header />
      
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12 items-center mb-24">
            <div className="lg:col-span-3 space-y-8 animate-fade-in">
              <QuoteRotator />
              <p className="text-xl text-deep-charcoal/80 font-poppins max-w-2xl">
                Your space to untangle your thoughts and find clarity through just chats.
              </p>
            </div>
            
            <div className="lg:col-span-2 animate-fade-up">
              <MusicPlayer />
            </div>
          </div>
          
          <div className="mt-auto animate-fade-up delay-300">
            <WritingInput />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
