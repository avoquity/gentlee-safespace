
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';

interface CheckInBannerProps {
  onDismiss: () => void;
}

export const CheckInBanner: React.FC<CheckInBannerProps> = ({ onDismiss }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("21:00");
  const { toast } = useToast();
  const { user } = useAuth();

  const handleYesClick = async () => {
    // Request notification permission
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsSheetOpen(true);
      } else {
        toast({
          title: "Notifications declined",
          description: "That's okay! You can always enable them later in your browser settings.",
        });
        onDismiss();
      }
    } else if (Notification.permission === 'granted') {
      setIsSheetOpen(true);
    }
  };

  const handleTimeSelection = async () => {
    setIsSheetOpen(false);
    
    try {
      // Save user preference in the database
      if (user) {
        await supabase
          .from('profiles')
          .update({ 
            checkin_enabled: true,
            checkin_time: selectedTime,
            last_notif_sent_at: null,
            notif_this_week_count: 0,
            banner_seen: true
          })
          .eq('id', user.id);
          
        // Register service worker
        await registerServiceWorker();
      }
      
      // Show confirmation toast with formatted time
      const timeFormat = selectedTime === "08:00" ? "8:00 AM" : "9:00 PM";
      toast({
        title: "Lovely!",
        description: `I'll check in around ${timeFormat}.`,
      });
      
      onDismiss();
    } catch (error) {
      console.error("Error saving check-in preferences:", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't save your preferences. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Get the push subscription
        let subscription = await registration.pushManager.getSubscription();
        
        // If no subscription exists, create one
        if (!subscription) {
          const vapidPublicKey = 'BFnrxYozGnJHHNBdYNwMSDXJXAtptGs0m8qDfXjdKQuR47dFB_bYVJb5WkvIQVjGtOFQ91p5JKOP9jAjBFLwMjQ';
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
          
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
          });
        }
        
        // Send the subscription to the server
        if (user && subscription) {
          await supabase
            .from('push_subscriptions')
            .upsert([
              {
                user_id: user.id,
                subscription: JSON.stringify(subscription),
                created_at: new Date().toISOString()
              }
            ], { onConflict: 'user_id' });
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  // Helper function to convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white border border-deep-charcoal/10 rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between"
        >
          <p className="text-deep-charcoal text-sm mr-4">
            Would it help if I checked in with you now and then? 🌱
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-muted-sage hover:bg-muted-sage hover:text-white text-sm px-3 py-2 h-auto"
              onClick={handleYesClick}
            >
              Yes, please
            </Button>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>When would you like a check-in?</SheetTitle>
            <SheetDescription>
              Choose a time that works best for you. I'll send gentle reminders around this time.
            </SheetDescription>
          </SheetHeader>
          <div className="py-8">
            <RadioGroup value={selectedTime} onValueChange={setSelectedTime} className="flex flex-col gap-4">
              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="08:00" id="morning" />
                <label htmlFor="morning" className="flex-1 cursor-pointer">Morning 08:00</label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="21:00" id="evening" />
                <label htmlFor="evening" className="flex-1 cursor-pointer">Evening 21:00</label>
              </div>
            </RadioGroup>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleTimeSelection} className="bg-muted-sage hover:bg-muted-sage/90 text-white">
              Save preference
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
