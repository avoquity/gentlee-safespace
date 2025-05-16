
import React from 'react';
import { X } from 'lucide-react';

interface ModalHeaderProps {
  onClose: () => void;
  isSheet: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose, isSheet }) => {
  return (
    <>
      {isSheet && (
        <div
          className="mx-auto my-2 w-12 h-[5px] rounded-full bg-deep-charcoal/10"
          aria-hidden="true"
        ></div>
      )}

      <div className={`flex justify-end mb-2 px-6`}>
        <button
          onClick={onClose}
          className="text-deep-charcoal hover:text-opacity-70 transition-all"
          aria-label="Close journal entry"
        >
          <X size={24} />
        </button>
      </div>
    </>
  );
};
