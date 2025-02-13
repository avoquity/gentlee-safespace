
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
          <div className="space-y-12">
            <div className="animate-fade-in">
              <QuoteRotator />
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <p className="text-xl text-deep-charcoal/80 font-poppins animate-fade-in">
                Your space to untangle your thoughts and find clarity through just chats.
              </p>
              <div className="flex justify-end animate-fade-up">
                <div className="max-w-md w-full">
                  <MusicPlayer />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-24 animate-fade-up delay-300">
            <WritingInput />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
