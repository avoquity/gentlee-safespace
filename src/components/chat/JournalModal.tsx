
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (text: string, saveAsLetter: boolean) => void;
  initialText?: string;
}

export const JournalModal: React.FC<JournalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSend,
  initialText = '',
}) => {
  const [text, setText] = useState(initialText);
  const [saveAsLetter, setSaveAsLetter] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setText(initialText);
      setSaveAsLetter(false);
    }
  }, [isOpen, initialText]);

  const handleSend = async () => {
    if (!text.trim()) return;
    
    try {
      onSend(text, saveAsLetter);
      
      if (saveAsLetter && user) {
        // Use the edge function to save the letter
        const response = await fetch('https://zmcmrivswbszhqqragli.supabase.co/functions/v1/insert_letter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`
          },
          body: JSON.stringify({
            user_id: user.id,
            message_text: text,
            send_date: null
          })
        });
        
        if (!response.ok) throw new Error('Failed to save letter');
      }
      
      // Close modal after sending
      onClose();
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your journal entry",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    // On cancel, copy text to main chat input (this will be handled by parent)
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] flex flex-col bg-[#FDFBF8]/95 backdrop-blur-sm border-deep-charcoal/20">
        <div className="absolute right-4 top-4">
          <DialogClose asChild>
            <button 
              className="rounded-full h-8 w-8 inline-flex items-center justify-center text-deep-charcoal hover:bg-muted-sage/10"
              onClick={handleCancel}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>
        
        <h2 className="text-xl font-serif text-deep-charcoal mb-4">Journal Entry</h2>
        
        <div className="flex-grow overflow-hidden min-h-[200px] mb-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-full min-h-[200px] p-4 text-deep-charcoal bg-transparent border border-deep-charcoal/20 rounded-md resize-none focus:outline-none focus:border-muted-sage"
            style={{ overflowY: 'auto' }}
          />
        </div>
        
        <div className="flex items-center space-x-2 mb-6">
          <Switch 
            id="save-letter" 
            checked={saveAsLetter} 
            onCheckedChange={setSaveAsLetter}
          />
          <Label htmlFor="save-letter" className="text-sm text-deep-charcoal">
            Save this as a letter to myself
          </Label>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-deep-charcoal text-deep-charcoal hover:bg-deep-charcoal/5"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend}
            className="bg-muted-sage hover:bg-muted-sage/90 text-white border-none"
            disabled={!text.trim()}
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
