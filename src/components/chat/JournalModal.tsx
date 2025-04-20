
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  initialText = '' 
}) => {
  const [journalText, setJournalText] = useState(initialText);
  const [isSavedAsLetter, setIsSavedAsLetter] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
      setJournalText(initialText);
    }
  }, [isOpen, initialText]);

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
      if (isSavedAsLetter && user) {
        const { data, error } = await supabase.rpc('create_letter', {
          p_message_text: journalText,
          p_send_date: new Date().toISOString()
        });

        if (error) throw error;
      }

      onSend(journalText, isSavedAsLetter);
      
      // Clear the text after sending but before closing to prevent flashing
      setJournalText('');
      setIsSavedAsLetter(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save journal entry.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    if (journalText.trim()) {
      onCancel(journalText);
    }
    setJournalText('');
    setIsSavedAsLetter(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="w-[70%] h-[70%] bg-soft-ivory rounded-lg shadow-xl flex flex-col p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-end mb-4">
              <button 
                onClick={handleCancel}
                className="text-deep-charcoal hover:text-opacity-70 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="Take your time. Write what's on your mind."
              className="w-full h-full bg-transparent text-lg text-deep-charcoal placeholder:text-deep-charcoal/50 resize-none focus:outline-none"
              style={{ overflowY: 'auto' }}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="save-letter"
                  checked={isSavedAsLetter}
                  onCheckedChange={setIsSavedAsLetter}
                />
                <label htmlFor="save-letter" className="text-sm text-deep-charcoal">
                  Save this as a letter to myself
                </label>
              </div>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button onClick={handleSend}>
                  <Send size={16} className="mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
