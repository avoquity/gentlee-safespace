
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { LocationState } from '@/types/chat';

interface ChatHeaderProps {
  onClose: () => void;
  entryDate?: string;
}

export const ChatHeader = ({ onClose, entryDate }: ChatHeaderProps) => {
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  // Use either provided entryDate, or date from location state, or 'New Entry'
  const displayDate = entryDate || 'New Entry';

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl sm:text-5xl md:text-[68px] font-montserrat font-semibold text-deep-charcoal">
        {displayDate}
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-deep-charcoal/10 transition-colors duration-200"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};
