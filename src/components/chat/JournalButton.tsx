
import React from "react";
import { Notebook } from "lucide-react";

interface JournalButtonProps {
  onClick: () => void;
  isMobile: boolean;
  className?: string;
}
export const JournalButton: React.FC<JournalButtonProps> = ({
  onClick,
  isMobile,
  className = "",
}) => {
  return (
    <button
      type="button"
      aria-label="Journal mode"
      title="Journal mode"
      tabIndex={0}
      onClick={onClick}
      className={`
        flex items-center justify-center 
        bg-transparent 
        focus:outline-none 
        transition 
        hover:bg-transparent 
        active:bg-transparent
        ${isMobile ? "" : ""} 
        ${className}
      `}
      style={{
        width: 44,
        height: 44,
        minWidth: 44,
        minHeight: 44,
        padding: 0,
      }}
    >
      <Notebook
        size={24}
        strokeWidth={2}
        color="#2E2E2E"
        aria-hidden="true"
      />
    </button>
  );
};
