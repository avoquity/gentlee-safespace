
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

type UpgradePromptProps = {
  messageCount: number;
  weeklyLimit: number;
  onDismiss?: () => void;
  className?: string;
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  messageCount, 
  weeklyLimit,
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
          {/* Only show dismiss button when approaching the limit (not at limit) */}
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
        <div className="flex flex-col">
          <p className="text-sm font-poppins font-medium">
            You've reached your weekly message limit. 
            <Link to="/upgrade" className="ml-1 font-medium text-muted-sage hover:underline">
              Upgrade to Reflection
            </Link> to continue.
          </p>
          <p className="text-xs mt-1 text-deep-charcoal/70">
            Free accounts are limited to {weeklyLimit} messages per week.
          </p>
        </div>
      )}
    </motion.div>
  );
};

