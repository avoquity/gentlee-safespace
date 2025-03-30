
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UpgradePromptProps {
  messageCount?: number;
  weeklyLimit?: number;
  onDismiss?: () => void;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  messageCount = 0, 
  weeklyLimit = 10,
  onDismiss,
  className 
}) => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
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
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSubscriptionStatus();
  }, [user]);
  
  // Don't show anything while loading or if user is subscribed
  if (isLoading || isSubscribed) return null;
  
  const isApproachingLimit = messageCount === weeklyLimit - 1;
  const isAtLimit = messageCount >= weeklyLimit;
  
  // If not approaching or at limit, don't show anything
  if (!isApproachingLimit && !isAtLimit) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 mb-4 rounded-md border border-muted-sage/30 bg-muted-sage/10 text-deep-charcoal relative ${className}`}
    >
      {isApproachingLimit && (
        <div className="flex justify-between items-center">
          <p className="text-sm font-poppins">
            You're about to reach your weekly message limit. 
            <Link to="/upgrade" className="ml-1 font-medium text-muted-sage hover:underline">
              Upgrade to Reflection
            </Link> to continue.
          </p>
          {onDismiss && (
            <button 
              onClick={onDismiss} 
              className="ml-2 text-deep-charcoal/60 hover:text-deep-charcoal"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
      
      {isAtLimit && (
        <p className="text-sm font-poppins">
          You've reached your weekly message limit. 
          <Link to="/upgrade" className="ml-1 font-medium text-muted-sage hover:underline">
            Upgrade to Reflection
          </Link> to continue.
        </p>
      )}
    </motion.div>
  );
};
