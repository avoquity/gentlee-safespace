
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Track window size for responsive modal (mobile/tablet style)
function useIsMobileSheet() {
  const [isSheet, setIsSheet] = React.useState(false);
  useEffect(() => {
    function update() {
      setIsSheet(window.innerWidth < 1024);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return isSheet;
}

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string, isSavedAsLetter: boolean) => void;
  onCancel: (text: string) => void;
  initialText?: string;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  onSend,
  onCancel,
  initialText = ""
}) => {
  const [journalText, setJournalText] = useState(initialText);
  const [isSavedAsLetter, setIsSavedAsLetter] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isSheet = useIsMobileSheet();

  // Autofocus on open
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      setJournalText(initialText);
    }
  }, [isOpen, initialText]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setIsSavedAsLetter(false);
      setIsSending(false);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!journalText.trim()) {
      toast({
        title: "Empty Journal Entry",
        description: "Please write something before sending.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSending(true);

      // Feature hidden: saving as letter (still in logic, not UI)
      if (isSavedAsLetter && user) {
        const { error } = await supabase.rpc('create_letter', {
          p_message_text: journalText,
          p_send_date: new Date().toISOString()
        });

        if (error) throw error;
      }

      onSend(journalText, isSavedAsLetter);
      setJournalText('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save journal entry.",
        variant: "destructive"
      });
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (journalText.trim()) {
      onCancel(journalText);
    }
    setJournalText('');
    onClose();
  };

  // Animation/config for mobile sheet vs. classic modal
  const modalMotionProps = isSheet
    ? {
        className:
          "fixed inset-x-0 bottom-0 z-50 flex items-end justify-center",
        initial: { y: "100%", opacity: 1 },
        animate: { y: 0, opacity: 1 },
        exit: { y: "100%" },
        transition: { type: "spring", bounce: 0.2, duration: 0.35 }
      }
    : {
        className:
          "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm",
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };

  const contentClass = isSheet
    ? "relative w-full max-w-md mx-auto h-[80dvh] rounded-t-3xl bg-soft-ivory flex flex-col pb-0 pt-4 px-0 shadow-xl overflow-hidden"
    : "w-[70%] h-[70%] bg-soft-ivory rounded-lg shadow-xl flex flex-col p-6";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div {...modalMotionProps}>
          <motion.div
            className={contentClass}
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.12, duration: 0.30 }}
          >
            {/* Drag handle/bar on top for sheet modal */}
            {isSheet && (
              <div
                className="mx-auto my-2 w-12 h-[5px] rounded-full bg-deep-charcoal/10"
                aria-hidden="true"
              ></div>
            )}

            <div className={`flex justify-end mb-2 px-6`}>
              <button
                onClick={handleCancel}
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
            {/* Feature Hidden: Save letter switch remains hidden here */}

            {/* "Sticky" Bottom Button Row */}
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
                onClick={handleCancel}
                disabled={isSending}
                className="flex-1 font-poppins rounded-full h-12 text-base"
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !journalText.trim()}
                className="flex-1 font-poppins rounded-full h-12 text-base flex items-center justify-center gap-2"
                type="button"
              >
                <Send size={18} className="mr-1 -ml-1" />
                Send
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
