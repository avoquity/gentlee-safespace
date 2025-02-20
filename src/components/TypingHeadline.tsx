
import React, { useState, useEffect } from 'react';

const headlines = [
  "Your space to untangle thoughts.",
  "Find clarity through conversation.",
  "Let your thoughts breathe freely.",
  "A gentle companion for reflection."
];

const TypingHeadline = () => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typeText = () => {
      const targetText = headlines[currentIndex];
      
      if (isDeleting) {
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentIndex((prev) => (prev + 1) % headlines.length);
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
          // Wait for 30 seconds before starting deletion
          timeout = setTimeout(() => {
            setIsTyping(true);
            setIsDeleting(true);
          }, 30000);
        }
      }
    };

    if (isTyping) {
      timeout = setTimeout(typeText, 100);
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentIndex, isTyping, isDeleting]);

  return (
    <div className="relative inline-block">
      <h1 className="text-4xl md:text-5xl font-bold text-deep-charcoal min-h-[3rem]">
        {currentText}
        <span 
          className="inline-block w-0.5 h-8 ml-1 bg-deep-charcoal animate-[blink_1s_infinite]" 
          style={{ verticalAlign: 'middle' }}
        />
      </h1>
    </div>
  );
};

export default TypingHeadline;
