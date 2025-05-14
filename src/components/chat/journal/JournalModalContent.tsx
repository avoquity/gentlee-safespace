
import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface JournalModalContentProps {
  journalText: string;
  setJournalText: (text: string) => void;
  onClose: () => void;
  isSheet: boolean;
}

export const JournalModalContent: React.FC<JournalModalContentProps> = ({
  journalText,
  setJournalText,
  onClose,
  isSheet
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <>
      {/* Drag handle/bar on top for sheet modal */}
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
      
      {/* Textarea */}
      <div className="flex-1 px-6 pb-3">
        <textarea
          ref={textareaRef}
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="Take your time. Write what's on your mind."
          className="w-full h-full bg-transparent text-lg text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none focus:outline-none font-poppins"
          autoFocus
          style={{
            minHeight: isSheet ? "150px" : "unset",
            overflowY: 'auto'
          }}
        />
      </div>
    </>
  );
};
