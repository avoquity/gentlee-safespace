
import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StickyVoiceButtonProps {
  onClick: () => void;
  isActive?: boolean;
}

export const StickyVoiceButton = ({ onClick, isActive = false }: StickyVoiceButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={`fixed top-6 right-6 z-40 h-14 w-14 rounded-full border-2 transition-all duration-200 shadow-lg hover:shadow-xl ${
        isActive
          ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
          : 'bg-white border-deep-charcoal text-deep-charcoal hover:bg-deep-charcoal hover:text-white hover:border-deep-charcoal'
      }`}
      aria-label="Voice mode"
      title="Voice mode"
    >
      <Mic className="w-6 h-6" />
    </Button>
  );
};
