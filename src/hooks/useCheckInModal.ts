
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { CheckInState } from '@/types/checkIn';
import { supabase } from '@/integrations/supabase/client';

// Time constants
const IDLE_THRESHOLD = 5000; // 5 seconds idle
const SESSION_THRESHOLD = 2; // Show again after 2 sessions
const HOURS_24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function useCheckInModal(userId?: string | null, messageCount = 0) {
  // Initial check-in state
  const initialState: CheckInState = {
    shown: false,
    lastDismissed: null,
    dismissCount: 0,
    optedIn: false,
    usedMoodSlider: false,
    moodValue: null,
    currentStep: 'mood'
  };

  // State management
  const [checkInData, setCheckInData] = useLocalStorage<CheckInState>('gentlee-checkin', initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity
  useEffect(() => {
    const resetTimer = () => setLastActivity(Date.now());
    
    // Listen for user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, []);

  // Check for recent messages from Gentlee
  const [hasRecentMessage, setHasRecentMessage] = useState(false);
  useEffect(() => {
    const checkRecentMessages = async () => {
      if (!userId) return;
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('user_role', 'ai')
        .gt('created_at', yesterday.toISOString())
        .limit(1);
      
      if (!error && data.length > 0) {
        setHasRecentMessage(true);
      }
    };
    
    checkRecentMessages();
  }, [userId]);

  // Main check-in logic
  useEffect(() => {
    if (!userId || checkInData.optedIn) return;
    
    // Check for idle time trigger
    const idleInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivity;
      const shouldTriggerByIdle = idleTime >= IDLE_THRESHOLD && messageCount >= 1 && hasRecentMessage;
      
      // Check for message count trigger
      const shouldTriggerByCount = messageCount >= 3 && hasRecentMessage;
      
      if ((shouldTriggerByIdle || shouldTriggerByCount) && !isOpen) {
        // Additional checks for dismissal history
        if (checkInData.usedMoodSlider) {
          // User has used mood slider but didn't opt-in
          if (checkInData.dismissCount >= SESSION_THRESHOLD) {
            setCheckInData(prev => ({...prev, currentStep: 'optin'}));
            setIsOpen(true);
            setCheckInData(prev => ({...prev, dismissCount: 0}));
          }
        } else if (checkInData.lastDismissed) {
          // User has dismissed before
          if (checkInData.dismissCount >= SESSION_THRESHOLD) {
            setIsOpen(true);
            setCheckInData(prev => ({...prev, dismissCount: 0}));
          }
        } else {
          // First time showing
          setIsOpen(true);
        }
      }
    }, 1000);

    return () => clearInterval(idleInterval);
  }, [userId, messageCount, lastActivity, hasRecentMessage, checkInData, isOpen]);

  // Event handlers
  const handleMoodSubmit = (value: number) => {
    setCheckInData(prev => ({
      ...prev,
      usedMoodSlider: true,
      moodValue: value,
      currentStep: 'optin'
    }));
    
    // Log analytics event
    if (userId) {
      try {
        fetch('https://zmcmrivswbszhqqragli.supabase.co/functions/v1/log-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            event_type: 'mood_selected',
            event_data: { mood_delta: value }
          })
        });
      } catch (error) {
        console.error("Failed to log mood selection:", error);
      }
    }
  };

  const handleOptIn = (optedIn: boolean) => {
    setCheckInData(prev => ({
      ...prev,
      optedIn,
      currentStep: optedIn ? 'success' : 'mood'
    }));
    
    if (optedIn) {
      // Log analytics event
      if (userId) {
        try {
          fetch('https://zmcmrivswbszhqqragli.supabase.co/functions/v1/log-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              event_type: 'nudges_opt_in',
              event_data: { opted_in: true }
            })
          });
        } catch (error) {
          console.error("Failed to log opt-in:", error);
        }
      }
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setCheckInData(prev => ({
      ...prev,
      lastDismissed: Date.now(),
      dismissCount: prev.dismissCount + 1
    }));
  };

  const handleComplete = () => {
    setIsOpen(false);
    // Reset state for next session
    setCheckInData(prev => ({
      ...prev,
      shown: true
    }));
  };

  return {
    isOpen,
    currentStep: checkInData.currentStep,
    moodValue: checkInData.moodValue,
    optedIn: checkInData.optedIn,
    handleMoodSubmit,
    handleOptIn,
    handleDismiss,
    handleComplete,
    setIsOpen
  };
}
