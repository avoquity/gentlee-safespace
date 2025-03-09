
import { useLocation } from 'react-router-dom';
import { X, Volume2, VolumeX } from 'lucide-react';

interface ChatHeaderProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onClose: () => void;
  entryDate?: string;
}

export const ChatHeader = ({ isMuted, onMuteToggle, onClose, entryDate }: ChatHeaderProps) => {
  const location = useLocation();
  const dateFromLocation = location.state?.entryDate;
  
  // Use either provided entryDate, or date from location state, or 'New Entry'
  const displayDate = entryDate || dateFromLocation || 'New Entry';

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-[68px] font-semibold text-deep-charcoal">
        {displayDate}
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={onMuteToggle}
          className="p-2 rounded-full hover:bg-deep-charcoal/10 transition-colors duration-200"
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
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
