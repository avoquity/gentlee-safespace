
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Volume2, VolumeX } from 'lucide-react';

interface ChatHeaderProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onClose: () => void;
}

export const ChatHeader = ({ isMuted, onMuteToggle, onClose }: ChatHeaderProps) => {
  return (
    <>
      <Link 
        to="/"
        className="absolute left-6 top-8 text-2xl font-bold text-deep-charcoal hover:text-dusty-rose transition-colors"
      >
        Gentlee
      </Link>

      <button
        onClick={onMuteToggle}
        className="absolute right-16 top-8 p-2 text-deep-charcoal/60 hover:text-dusty-rose transition-colors"
      >
        {isMuted ? (
          <Volume2 className="w-6 h-6" />
        ) : (
          <VolumeX className="w-6 h-6" />
        )}
      </button>

      <button
        onClick={onClose}
        className="absolute right-6 top-8 p-2 text-deep-charcoal/60 hover:text-dusty-rose transition-colors"
        aria-label="Close conversation"
      >
        <X className="w-6 h-6" />
      </button>
    </>
  );
};
