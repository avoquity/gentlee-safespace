import React, { useState, useRef, useEffect } from 'react';
import { NotebookPen, Bell, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { JournalModal } from './JournalModal';
import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ScrollToTop } from './ScrollToTop';
import { Highlight, Message } from '@/types/chat';
import { ScrollToTopFloating } from './ScrollToTopFloating';
import { CheckInBanner } from './CheckInBanner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProfileWithCheckIn } from '@/types/databaseTypes';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  isMuted: boolean;
  highlights: Highlight[];
  displayDate?: string;
  messageCount?: number;
  weeklyLimit?: number;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onMuteToggle: () => void;
  onHighlightChange: (highlight: Highlight) => void;
  onHighlightRemove: (highlightId: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  input,
  setInput,
  isTyping,
  isMuted,
  highlights,
  displayDate,
  messageCount = 0,
  weeklyLimit = 10,
  onSubmit,
  onClose,
  onMuteToggle,
  onHighlightChange,
  onHighlightRemove,
  messagesEndRef
}) => {
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [showCheckInBanner, setShowCheckInBanner] = useState(false);
  const [checkInEnabled, setCheckInEnabled] = useState(false);
  const [isIdleAtBottom, setIsIdleAtBottom] = useState(true); 
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndWrapperRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // New state for permission alert
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swActive, setSwActive] = useState(false);

  // Check if user is eligible to see the check-in banner
  useEffect(() => {
    const checkBannerEligibility = async () => {
      if (!user) {
        console.log("Banner eligibility check: No user logged in");
        return;
      }

      if (messages.length === 0) {
        console.log("Banner eligibility: No messages yet");
        return;
      }

      try {
        // Check if user has previously set check-in preferences
        const savedEnabledState = localStorage.getItem('gentlee-checkin-enabled');
        if (savedEnabledState) {
          setCheckInEnabled(JSON.parse(savedEnabledState));
        }
        
        // Always show the banner if user has at least 1 message
        setShowCheckInBanner(true);
        
        // Force isIdleAtBottom to true to ensure the banner shows up
        setTimeout(() => {
          setIsIdleAtBottom(true);
        }, 1000);
      } catch (error) {
        console.error("Error checking banner eligibility:", error);
      }
    };

    // Add a slight delay to ensure user data has loaded
    const timer = setTimeout(() => {
      checkBannerEligibility();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, messages]);

  // Track when user is idle at the bottom of the chat
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }

      const isAtBottom = Math.abs(container.scrollHeight - container.clientHeight - container.scrollTop) < 100; // Increased threshold
      
      if (isAtBottom) {
        // Set a timer to detect idle state at bottom
        idleTimerRef.current = window.setTimeout(() => {
          console.log("User is idle at bottom, setting isIdleAtBottom to true");
          setIsIdleAtBottom(true);
        }, 1500); // Reduced idle time threshold
      } else {
        setIsIdleAtBottom(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    
    // Trigger the idle detection immediately
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [showCheckInBanner]);

  // Directly log the values to help with debugging
  useEffect(() => {
    console.log("Banner visibility conditions:", { showCheckInBanner, isIdleAtBottom });
    
    // For testing: Show a toast when banner conditions change
    if (showCheckInBanner && isIdleAtBottom && isDevelopment) {
      toast({
        title: "Banner conditions met",
        description: "The banner should be visible now",
      });
    }
  }, [showCheckInBanner, isIdleAtBottom, toast, isDevelopment]);

  const handleModalSend = (text: string, isSavedAsLetter: boolean) => {
    if (!text.trim()) return;
    setInput(text);
    if (formRef.current) {
      setTimeout(() => {
        formRef.current?.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
        setIsJournalModalOpen(false);
        setJournalText('');
      }, 0);
    }
  };

  const handleModalCancel = (text: string) => {
    setInput(text);
  };

  const handleBannerDismiss = async () => {
    setShowCheckInBanner(false);
    
    // Update localStorage to mark banner as seen
    if (user) {
      try {
        // Get existing preferences or create new object
        const savedPreferences = localStorage.getItem('gentlee-checkin-preferences');
        const preferences = savedPreferences 
          ? JSON.parse(savedPreferences) 
          : { userId: user.id };
        
        // Mark banner as seen
        preferences.bannerSeen = true;
        
        // Save back to localStorage
        localStorage.setItem('gentlee-checkin-preferences', JSON.stringify(preferences));
        console.log("Banner seen status saved to localStorage");
      } catch (error) {
        console.error("Error updating banner seen status:", error);
      }
    }
  };

  // Register service worker and set up listeners
  useEffect(() => {
    const registerSW = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service worker registered successfully in ChatContainer');
          setSwRegistration(registration);
          
          // Check if service worker is active
          if (registration.active) {
            setSwActive(true);
            
            // Ping the service worker to make sure it's responding
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'PING'
              });
            }
          } else {
            // Wait for the service worker to become active
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated') {
                    setSwActive(true);
                    toast({
                      title: "Service worker activated",
                      description: "Notification features are now available"
                    });
                  }
                });
              }
            });
          }
        } catch (error) {
          console.error('Service worker registration failed in ChatContainer:', error);
          toast({
            title: "Service worker error",
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive"
          });
        }
      }
    };
    
    registerSW();
    
    // Set up message listener
    const messageHandler = (event: MessageEvent) => {
      if (event.data) {
        console.log('Message from service worker:', event.data);
        
        if (event.data.type === 'PONG') {
          console.log('Service worker is active and responding');
          setSwActive(true);
        } else if (event.data.type === 'NOTIFICATION_SHOWN') {
          toast({
            title: "Test notification sent",
            description: "Check your notification tray"
          });
        } else if (event.data.type === 'NOTIFICATION_ERROR') {
          toast({
            title: "Notification error",
            description: event.data.error || "Unknown error",
            variant: "destructive"
          });
          
          // If the error is permission-related, show the permission alert
          if (event.data.error?.includes('permission')) {
            setShowPermissionAlert(true);
          }
        }
      }
    };
    
    navigator.serviceWorker.addEventListener('message', messageHandler);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
    };
  }, [toast]);

  // Reset banner visibility for testing
  const resetBanner = async () => {
    if (user) {
      try {
        // Clear localStorage or update it
        const savedPreferences = localStorage.getItem('gentlee-checkin-preferences');
        if (savedPreferences) {
          const preferences = JSON.parse(savedPreferences);
          preferences.bannerSeen = false;
          localStorage.setItem('gentlee-checkin-preferences', JSON.stringify(preferences));
        }
          
        toast({
          title: "Banner reset",
          description: "Check-in banner has been reset and should show again."
        });
        
        setShowCheckInBanner(true);
        setIsIdleAtBottom(true);
      } catch (error) {
        console.error("Error resetting banner status:", error);
        toast({
          title: "Error",
          description: "Failed to reset check-in banner status."
        });
      }
    }
  };

  // Force banner to show for testing purposes
  const forceShowBanner = () => {
    setShowCheckInBanner(true);
    setIsIdleAtBottom(true);
  };
  
  // Check notification permission status
  const checkPermissionStatus = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "This browser does not support notifications",
        variant: "destructive"
      });
      return;
    }
    
    const permission = Notification.permission;
    toast({
      title: "Permission status",
      description: `Notification permission is currently: ${permission}`
    });
    
    if (permission === 'denied') {
      setShowPermissionAlert(true);
    }
  };
  
  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      toast({
        title: "Permission result",
        description: `User ${result === 'granted' ? 'accepted' : 'declined'} notifications`
      });
      
      if (result === 'granted') {
        sendTestNotification();
      } else if (result === 'denied') {
        setShowPermissionAlert(true);
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast({
        title: "Error",
        description: "Could not request notification permission",
        variant: "destructive"
      });
    }
  };
  
  // Send test notification
  const sendTestNotification = async () => {
    // First check if notification permission is granted
    if (!('Notification' in window)) {
      toast({
        title: "Notifications not supported",
        description: "This browser does not support notifications",
        variant: "destructive"
      });
      return;
    }
    
    if (Notification.permission === 'denied') {
      setShowPermissionAlert(true);
      return;
    }
    
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast({
            title: "Permission denied",
            description: "Please allow notifications to test this feature"
          });
          return;
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        toast({
          title: "Error",
          description: "Could not request notification permission"
        });
        return;
      }
    }
    
    // Try to send notification via service worker first (preferred method)
    if (swActive && navigator.serviceWorker.controller) {
      try {
        console.log("Sending test notification request to service worker");
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_TEST_NOTIFICATION',
          title: 'Gentlee Service Worker Test',
          message: 'This notification comes from the service worker!'
        });
        
        // Toast will be shown by the message listener after confirmation
      } catch (swError) {
        console.error("Error sending message to service worker:", swError);
        
        // Fallback to direct notification
        tryDirectNotification();
      }
    } else {
      console.log("Service worker not active, trying direct notification");
      tryDirectNotification();
    }
  };
  
  // Direct notification as fallback
  const tryDirectNotification = () => {
    try {
      const notification = new Notification("Gentlee Test", {
        body: "This is a direct test notification.",
        icon: '/favicon.ico'
      });
      
      toast({
        title: "Test notification sent",
        description: "Check your notification tray"
      });
    } catch (error) {
      console.error("Error showing direct notification:", error);
      toast({
        title: "Error",
        description: "Could not show notification: " + (error instanceof Error ? error.message : "Unknown error"),
        variant: "destructive"
      });
    }
  };
  
  // Open browser notification settings (only works in some browsers)
  const openNotificationSettings = () => {
    if ('permissions' in navigator) {
      try {
        // @ts-ignore - This is not in the standard TypeScript definitions yet
        navigator.permissions.query({ name: 'notifications' }).then(permissionStatus => {
          console.log('Current permission state:', permissionStatus.state);
          
          // This only works in some browsers (Chrome/Edge)
          if (document.hasStorageAccess) {
            // Just show a toast as we can't directly open settings
            toast({
              title: "Settings info",
              description: "To update notification permissions, please go to your browser settings"
            });
            setShowPermissionAlert(false);
          } else {
            toast({
              title: "Not supported",
              description: "Your browser doesn't support opening permission settings directly."
            });
          }
        });
      } catch (error) {
        console.error("Error accessing permission settings:", error);
        toast({
          title: "Not supported",
          description: "Your browser doesn't support opening permission settings directly."
        });
      }
    } else {
      toast({
        title: "Not supported",
        description: "Your browser doesn't support opening permission settings directly."
      });
    }
  };

  // Reset service worker for testing
  const resetServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // Unregister all service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
        
        toast({
          title: "Service worker reset",
          description: "All service workers have been unregistered"
        });
        
        setSwActive(false);
        setSwRegistration(null);
        
        // Register service worker again after a short delay
        setTimeout(async () => {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            setSwRegistration(registration);
            toast({
              title: "Service worker registered",
              description: "New service worker has been registered"
            });
          } catch (error) {
            console.error("Error re-registering service worker:", error);
          }
        }, 1000);
      } catch (error) {
        console.error("Error resetting service workers:", error);
        toast({
          title: "Error",
          description: "Could not reset service workers"
        });
      }
    }
  };

  const handleCheckInToggle = async (enabled: boolean) => {
    setCheckInEnabled(enabled);
    
    // In a production app, we would update the user's profile in the database
    // For now, just use localStorage
    localStorage.setItem('gentlee-checkin-enabled', JSON.stringify(enabled));
    
    // Log to console for demonstration
    console.log(`Check-in ${enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="min-h-screen bg-soft-ivory flex flex-col relative" ref={containerRef} style={{position: 'relative', overflow: 'auto'}}>
      {isDevelopment && (
        <div className="absolute top-2 left-2 z-50">
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
            Dev Mode
          </Badge>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto pt-24 pb-32 px-4 sm:px-6 relative">
          <ChatHeader 
            isMuted={isMuted}
            onMuteToggle={onMuteToggle}
            onClose={onClose}
            entryDate={displayDate}
          />
          <ChatMessages 
            messages={messages}
            highlights={highlights}
            isTyping={isTyping}
            onHighlightChange={onHighlightChange}
            onHighlightRemove={onHighlightRemove}
            messagesEndRef={messagesEndRef}
          />
          <div ref={messagesEndWrapperRef} style={{ height: 1, position: 'relative'}} aria-hidden />
          
          {/* Debug buttons for testing - only visible in development */}
          {isDevelopment && (
            <div className="mt-4 mb-4 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={forceShowBanner}
                className="text-xs"
              >
                Force Show Banner
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetBanner}
                className="text-xs"
              >
                Reset Banner Status
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={sendTestNotification}
                className="text-xs flex items-center gap-1"
              >
                <Bell className="h-3 w-3" /> Test Notification
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkPermissionStatus}
                className="text-xs"
              >
                Check Permission
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={requestNotificationPermission}
                className="text-xs"
              >
                Request Permission
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetServiceWorker}
                className="text-xs flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Reset SW
              </Button>
              {/* Fix the Badge variant from "success" to "secondary" with custom classes */}
              <Badge 
                variant={swActive ? "secondary" : "destructive"} 
                className={`text-xs ${swActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}`}
              >
                {swActive ? "SW Active" : "SW Inactive"}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <ScrollToTopFloating scrollContainer={containerRef} />

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-soft-ivory via-soft-ivory to-transparent py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          {/* Always show the banner if conditions are met, regardless of user scrolling */}
          {showCheckInBanner && (
            <CheckInBanner 
              onToggle={handleCheckInToggle} 
              initialEnabled={checkInEnabled}
            />
          )}
          
          <form ref={formRef} onSubmit={onSubmit}>
            <ChatInput 
              input={input}
              setInput={setInput}
              handleSubmit={onSubmit}
              messageCount={messageCount}
              weeklyLimit={weeklyLimit}
              onJournalClick={() => setIsJournalModalOpen(true)}
            />
          </form>
        </div>
      </div>
      
      <JournalModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onSend={handleModalSend}
        onCancel={handleModalCancel}
        initialText={journalText}
      />
      
      <ScrollToTop scrollContainer={containerRef} endRef={messagesEndWrapperRef} isTyping={isTyping} />
      
      <audio
        src="/path-to-your-music.mp3"
        autoPlay
        loop
        muted={isMuted}
      />
      
      {/* Permission denied alert */}
      <AlertDialog open={showPermissionAlert} onOpenChange={setShowPermissionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification Permission Denied</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Notifications are currently blocked in your browser settings. To test notifications:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click the lock/info icon in your address bar</li>
                <li>Find "Notifications" in the site settings</li>
                <li>Change the setting from "Block" to "Allow"</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                After changing settings, try the "Test Notification" button again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowPermissionAlert(false)}>
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
