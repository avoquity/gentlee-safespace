
import React, { useRef, useEffect } from 'react';

interface JournalTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isSheet: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const JournalTextarea: React.FC<JournalTextareaProps> = ({
  value,
  onChange,
  isSheet,
  autoFocus = true,
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofocus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="flex-1 px-6 pb-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder="Take your time. Write what's on your mind."
        className="w-full h-full bg-transparent text-lg text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none focus:outline-none font-poppins"
        autoFocus={autoFocus}
        disabled={disabled}
        style={{
          minHeight: isSheet ? "150px" : "unset",
          overflowY: 'auto'
        }}
      />
    </div>
  );
};
