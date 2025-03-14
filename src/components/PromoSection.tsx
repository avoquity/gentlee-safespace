
import React from 'react';
import { ExternalLink } from 'lucide-react';

const PromoSection = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-center gap-2 text-center">
        <p className="text-lg md:text-xl font-poppins text-deep-charcoal/90">
          🚀 We're giving <span className="font-semibold">lifetime access</span> to our first 20 users. 
          The next 50 get <span className="font-semibold">50% off forever</span>!
        </p>
        
        <a 
          href="/auth?tab=signup" 
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 text-lg font-poppins text-dusty-rose hover:text-muted-sage transition-colors duration-300 whitespace-nowrap"
        >
          Sign up now 
          <ExternalLink className="w-4 h-4 inline-block transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </div>
  );
};

export default PromoSection;
