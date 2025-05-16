
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobileSheet } from '@/hooks/useIsMobileSheet';
import { ModalOverlay } from './journal/ModalOverlay';
import { ModalHeader } from './journal/ModalHeader';
import { JournalTextarea } from './journal/JournalTextarea';
import { JournalActions } from './journal/JournalActions';

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
  const [isSending, setIsSending] = useState(false);
  const [isSavedAsLetter, setIsSavedAsLetter] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isSheet = useIsMobileSheet();

  // Set initial text when modal opens
  useEffect(() => {
    if (isOpen) {
      setJournalText(initialText);
    }
  }, [isOpen, initialText]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setIsSending(false);
      setIsSavedAsLetter(false);
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

      // Feature hidden: saving as letter (logic kept but not used, UI hidden)
      if (isSavedAsLetter && user) {
        const { error } = await supabase.rpc('create_letter', {
          p_message_text: journalText,
          p_send_date: new Date().toISOString()
        });

        if (error) throw error;
      }

      onSend(journalText, isSavedAsLetter); // Pass the text to parent for immediate sending
      setJournalText('');
      onClose();
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
    onCancel(journalText); // Pass the current text back to the input field
    setJournalText('');
    onClose();
  };

  const handleCloseClick = () => {
    // This function is called when the X button is clicked
    // We should only transfer the text back to the input field but NOT send it
    onCancel(journalText);
    setJournalText('');
    onClose();
  };

  // Modal/sheet animation/config
  const modalMotionProps = isSheet
    ? {
        className: "fixed inset-x-0 bottom-0 z-50 flex items-end justify-center",
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
        <>
          {/* Overlay for mobile/tablet, only when modal is open and in sheet mode */}
          {isSheet && <ModalOverlay onClick={handleCloseClick} />}
          
          <motion.div {...modalMotionProps}>
            <motion.div
              className={contentClass}
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.12, duration: 0.30 }}
              onClick={e => e.stopPropagation()} // prevent closing modal when clicking inside
            >
              <ModalHeader onClose={handleCloseClick} isSheet={isSheet} />
              
              <JournalTextarea 
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                isSheet={isSheet}
              />
              
              <JournalActions 
                onCancel={handleCancel}
                onSend={handleSend}
                isSending={isSending}
                hasContent={!!journalText.trim()}
                isSheet={isSheet}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
