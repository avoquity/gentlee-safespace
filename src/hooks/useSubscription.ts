
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setIsSubscriptionLoading(false);
        return;
      }
      
      try {
        setIsSubscriptionLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_current_period_end')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        // Check if user has an active subscription
        const hasActiveSubscription = data?.subscription_status === 'active';
        
        // Check if subscription is still valid (not expired)
        const isStillValid = data?.subscription_current_period_end 
          ? new Date(data.subscription_current_period_end) > new Date() 
          : false;
        
        setIsSubscribed(hasActiveSubscription && isStillValid);
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setIsSubscribed(false);
      } finally {
        setIsSubscriptionLoading(false);
      }
    };
    
    checkSubscriptionStatus();
  }, [user]);

  return { isSubscribed, isSubscriptionLoading };
};
