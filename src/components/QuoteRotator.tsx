
import React, { useState, useEffect } from 'react';

const quotes = [
  "You are not what hurt you. You are what chose to heal.",
  "Some things are meant to be felt, not fixed. Feel them and let them go.",
  "You've survived every difficult day so far. That's proof enough—you can survive this too."
];

const QuoteRotator = () => {
  const [currentText, setCurrentText] = useState('');
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typeText = () => {
      const targetText = quotes[currentQuote];
      
      if (isDeleting) {
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentQuote((prev) => (prev + 1) % quotes.length);
          timeout = setTimeout(typeText, 100);
        } else {
          setCurrentText(prev => prev.slice(0, -1));
          timeout = setTimeout(typeText, 50);
        }
      } else {
        if (currentText.length < targetText.length) {
          setCurrentText(targetText.slice(0, currentText.length + 1));
          timeout = setTimeout(typeText, 100);
        } else {
          setIsTyping(false);
          // After quote is fully typed, wait 20 seconds then start deletion
          timeout = setTimeout(() => {
            setIsTyping(true);
            setIsDeleting(true);
            typeText(); // Start the deletion immediately after timeout
          }, 20000);
        }
      }
    };

    timeout = setTimeout(typeText, 100);

    return () => clearTimeout(timeout);
  }, [currentText, currentQuote, isTyping, isDeleting]);

  return (
    <div className="w-[75vw]">
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-montserrat font-extrabold text-deep-charcoal leading-tight">
        {currentText}
        <span 
          className="inline-block w-1 ml-2 bg-deep-charcoal animate-[blink_1s_infinite]" 
          style={{ height: '1em', verticalAlign: 'middle' }}
        />
      </h1>
    </div>
  );
};

export default QuoteRotator;
