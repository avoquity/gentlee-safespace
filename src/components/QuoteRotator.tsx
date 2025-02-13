
import React, { useState, useEffect } from 'react';

const quotes = [
  "You've survived every difficult day so far. You can survive this too.",
  "You are not what hurt you. You are what chose to heal.",
  "Some things are meant to be felt, not fixed. Feel them and let them go."
];

const QuoteRotator = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[75vw]">
      <h1 
        className={`text-5xl md:text-7xl lg:text-8xl font-montserrat font-extrabold text-deep-charcoal leading-tight transition-opacity duration-1000 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {quotes[currentQuote]}
      </h1>
    </div>
  );
};

export default QuoteRotator;
