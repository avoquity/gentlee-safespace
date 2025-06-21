
import React from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceModeButtonProps {
  onClick: () => void;
  className?: string;
}

export const VoiceModeButton = ({ onClick, className = '' }: VoiceModeButtonProps) => {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={`h-[42px] w-[42px] p-0 rounded-full border-2 border-deep-charcoal bg-transparent hover:bg-deep-charcoal hover:text-white transition-all duration-200 flex items-center justify-center ${className}`}
      aria-label="Voice mode"
      title="Voice mode"
    >
      <Mic className="w-5 h-5 text-deep-charcoal hover:text-white" />
    </Button>
  );
};
