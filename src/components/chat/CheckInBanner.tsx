
import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";

interface CheckInBannerProps {
  onDismiss: () => void;
}

// Store preferences in localStorage to avoid database schema issues
const savePreferencesToLocalStorage = (userId: string, time: string) => {
  const preferences = {
    userId,
    checkinEnabled: true,
    checkinTime: time,
    lastNotifSentAt: null,
    notifThisWeekCount: 0,
    bannerSeen: true
  };
  
  localStorage.setItem('gentlee-checkin-preferences', JSON.stringify(preferences));
  return preferences;
};

export const CheckInBanner: React.FC<CheckInBannerProps> = ({ onDismiss }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>("21:00");
  const [devMode, setDevMode] = useState(process.env.NODE_ENV !== 'production');
  const [testNotifications, setTestNotifications] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showDevWarning, setShowDevWarning] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check notification permission on component mount
  React.useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'denied') {
        setPermissionError('Notifications are blocked in your browser settings.');
      }
    } else {
      setPermissionError('Notifications are not supported in this browser.');
    }
  }, []);

  const handleYesClick = async () => {
    console.log("Yes clicked - current notification permission:", Notification.permission);
    
    // Always show the sheet in dev mode
    if (devMode) {
      console.log("Dev mode enabled, bypassing permission check");
      setIsSheetOpen(true);
      
      // In dev mode but permission denied, show a warning
      if (Notification.permission === 'denied') {
        setShowDevWarning(true);
      }
      return;
    }
    
    // Production mode permission handling
    try {
      if (Notification.permission === 'default') {
        console.log("Requesting notification permission");
        const permission = await Notification.requestPermission();
        console.log("Permission result:", permission);
        
        if (permission === 'granted') {
          setIsSheetOpen(true);
          setPermissionError(null);
        } else {
          toast({
            title: "Notifications declined",
            description: "That's okay! You can always enable them later in your browser settings.",
          });
          onDismiss();
        }
      } else if (Notification.permission === 'denied') {
        console.log("Notifications are blocked, showing toast");
        setPermissionError('Notifications are blocked in your browser settings.');
        // Still show the sheet in case they want to bypass in dev mode
        if (process.env.NODE_ENV !== 'production') {
          setIsSheetOpen(true);
          setShowDevWarning(true);
        } else {
          toast({
            title: "Notifications are blocked",
            description: "Please enable notifications in your browser settings to use this feature.",
          });
        }
      } else {
        // Permission already granted
        setIsSheetOpen(true);
      }
    } catch (error: any) {
      console.error("Error handling notification permission:", error);
      toast({
        title: "Something went wrong",
        description: "We couldn't request notification permission.",
        variant: "destructive",
      });
    }
  };

  const handleTimeSelection = async () => {
    console.log("Time selected:", selectedTime);
    setIsSheetOpen(false);
    
    try {
      // Save user preference - using localStorage instead of database to avoid schema issues
      if (user) {
        console.log("Saving check-in preferences for user:", user.id);
        
        // Store preferences in localStorage instead of updating profile
        const preferences = savePreferencesToLocalStorage(user.id, selectedTime);
        console.log("Preferences saved to localStorage:", preferences);
          
        // Register service worker if not in dev mode or if test notifications is enabled
        if (!devMode || testNotifications) {
          await registerServiceWorker();
          
          // For testing: show a test notification if in dev mode with test notifications enabled
          if (devMode && testNotifications) {
            setTimeout(() => {
              showTestNotification();
            }, 2000);
          }
        } else {
          console.log("Dev mode: Skipping service worker registration");
          
          // For dev mode, log to console
          console.log("Dev mode: Simulating push subscription analytics logging");
        }
      }
      
      // Show confirmation toast with formatted time
      const timeFormat = selectedTime === "08:00" ? "8:00 AM" : "9:00 PM";
      toast({
        title: "Lovely!",
        description: `I'll check in around ${timeFormat}.${devMode ? " (Dev mode)" : ""}`,
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

  const showTestNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          // Try direct notification first
          const title = 'Gentlee Check-in (Test)';
          const options = {
            body: 'This is a test notification. How are you feeling today?',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            data: {
              url: '/chat',
              type: 'test'
            }
          };
          
          new Notification(title, options);
          console.log('Test notification shown');
          toast({
            title: "Test notification sent",
            description: "Check your notification tray"
          });
        } catch (error) {
          console.error('Error showing test notification:', error);
          
          // Try via service worker if direct notification fails
          if (swRegistered && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
              navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_TEST_NOTIFICATION',
                title: 'Gentlee Service Worker Test',
                message: 'This notification comes from the service worker!'
              });
              console.log('Test notification request sent to service worker');
            } catch (swError) {
              console.error('Error sending message to service worker:', swError);
              toast({
                title: "Error",
                description: "Could not send test notification",
                variant: "destructive"
              });
            }
          } else {
            toast({
              title: "Error",
              description: "Could not display test notification",
              variant: "destructive"
            });
          }
        }
      } else if (Notification.permission === 'denied') {
        console.log('Notifications not permitted - denied');
        toast({
          title: "Notifications blocked",
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        });
      } else {
        // Permission is 'default' (not decided yet)
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            showTestNotification(); // Try again if granted
          } else {
            toast({
              title: "Notification permission required",
              description: "Please allow notifications to test this feature",
              variant: "destructive"
            });
          }
        });
      }
    } else {
      console.log('Notifications not supported');
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
    }
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        console.log("Registering service worker");
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log("Service worker registered:", registration);
        setSwRegistered(true);
        
        // If test notifications enabled and we're in dev mode, don't try to get push subscription
        if (devMode && testNotifications) {
          console.log("Dev mode with test notifications: skipping push subscription");
          return;
        }
        
        // In a real environment, we would handle push subscriptions here
        // This is skipped in our implementation to focus on notification testing
        console.log("Production mode would handle push subscriptions here");
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        
        // Even if registration fails, we can still test notifications in dev mode
        if (devMode) {
          console.log("Dev mode: continuing despite service worker registration failure");
        } else {
          throw error; // Re-throw in production mode
        }
      }
    } else {
      console.log("Service Workers are not supported in this browser");
      if (!devMode) {
        throw new Error("Service Workers not supported");
      }
    }
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
          
          {/* Permission warning alert */}
          {showDevWarning && (
            <Alert variant="warning" className="mt-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Developer Testing Mode</AlertTitle>
              <AlertDescription className="text-amber-700">
                <p className="mb-2">
                  Notifications are currently blocked in your browser, but you can still test the interface in developer mode.
                </p>
                <p className="text-xs">
                  To enable actual notifications, click the lock/info icon in your address bar and change notifications from "Block" to "Allow".
                </p>
              </AlertDescription>
            </Alert>
          )}
          
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
            
            {/* Development mode settings */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 p-3 bg-gray-50 rounded-md space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dev-mode" className="text-sm text-gray-600">Development testing mode</Label>
                  <Switch
                    id="dev-mode"
                    checked={devMode}
                    onCheckedChange={setDevMode}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Bypasses notification permission checks for testing
                </p>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <Label htmlFor="test-notifs" className="text-sm text-gray-600">Test notifications</Label>
                  <Switch
                    id="test-notifs"
                    checked={testNotifications}
                    onCheckedChange={setTestNotifications}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Enables immediate test notification after saving
                </p>
              </div>
            )}
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
