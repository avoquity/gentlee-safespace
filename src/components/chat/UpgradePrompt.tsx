
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const isApproachingLimit = messageCount === weeklyLimit - 1;
  const isAtLimit = messageCount >= weeklyLimit;
  
  if (!isApproachingLimit && !isAtLimit) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 mb-4 rounded-md border border-muted-sage/30 bg-muted-sage/10 text-deep-charcoal relative z-50 ${className}`}
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
