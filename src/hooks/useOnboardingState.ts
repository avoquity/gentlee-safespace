
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingState {
  isFirstTimeUser: boolean;
  onboardingCompleted: boolean;
  firstChatCompleted: boolean;
  isLoading: boolean;
}

export const useOnboardingState = () => {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isFirstTimeUser: true,
    onboardingCompleted: false,
    firstChatCompleted: false,
    isLoading: true
  });

  useEffect(() => {
    const fetchOnboardingState = async () => {
      if (!user) {
        setState({ isFirstTimeUser: true, onboardingCompleted: false, firstChatCompleted: false, isLoading: false });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed, first_chat_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setState({
          isFirstTimeUser: !data?.onboarding_completed,
          onboardingCompleted: data?.onboarding_completed || false,
          firstChatCompleted: data?.first_chat_completed || false,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching onboarding state:', error);
        setState({ isFirstTimeUser: true, onboardingCompleted: false, firstChatCompleted: false, isLoading: false });
      }
    };

    fetchOnboardingState();
  }, [user]);

  const markFirstChatCompleted = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ first_chat_completed: true })
        .eq('id', user.id);

      setState(prev => ({ ...prev, firstChatCompleted: true }));
    } catch (error) {
      console.error('Error marking first chat completed:', error);
    }
  };

  const markOnboardingCompleted = async () => {
    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      setState(prev => ({ ...prev, onboardingCompleted: true, isFirstTimeUser: false }));
    } catch (error) {
      console.error('Error marking onboarding completed:', error);
    }
  };

  return {
    ...state,
    markFirstChatCompleted,
    markOnboardingCompleted
  };
};
