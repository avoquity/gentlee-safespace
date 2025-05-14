
import React from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface JournalModalActionsProps {
  onCancel: () => void;
  onSend: () => void;
  isSending: boolean;
  isValidText: boolean;
  isSheet: boolean;
}

export const JournalModalActions: React.FC<JournalModalActionsProps> = ({
  onCancel,
  onSend,
  isSending,
  isValidText,
  isSheet
}) => {
  return (
    <div
      className={`
        w-full px-6 pb-[max(18px,env(safe-area-inset-bottom))] pt-0 
        flex gap-3
        ${isSheet
          ? "sticky bottom-0 bg-soft-ivory"
          : "mt-4 bg-soft-ivory/95 border-t-0"}
      `}
      style={{
        boxShadow: isSheet
          ? "0px -8px 32px 0 rgba(202 189 176 / 7%)"
          : undefined
      }}
    >
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={isSending}
        className="flex-1 font-poppins rounded-full h-12 text-base"
        type="button"
      >
        Cancel
      </Button>
      <Button
        onClick={onSend}
        disabled={isSending || !isValidText}
        className="flex-1 font-poppins rounded-full h-12 text-base flex items-center justify-center gap-2"
        type="button"
      >
        <Send size={18} className="mr-1 -ml-1" />
        Send
      </Button>
    </div>
  );
};
