
import React from 'react';
import { motion } from 'framer-motion';

// Bank of curated insights for selection
export const INSIGHT_BANK = [
  "You speak like someone who carries others, even when you're barely holding yourself.",
  "This isn't just about what happened. It's about how long you've held it in.",
  "It sounds like you're grieving something others never saw you lose.",
  "Sometimes your silence is your way of protecting others from how loud your pain really is.",
  "You've been doing the brave thing for so long, it probably doesn't feel like bravery anymore.",
  "Maybe the tiredness isn't from what you're doing — but from pretending it doesn't hurt.",
  "The way you're blaming yourself sounds like a habit you picked up to stay safe.",
  "You're trying to explain something that was never your fault in the first place.",
  "I wonder if your heart is still waiting for someone to say, \"That should never have happened to you.\"",
  "You're not asking for much. You're asking for what you should've had all along."
];

interface InsightCardProps {
  insight: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  return (
    <motion.div 
      className="insight-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {insight}
    </motion.div>
  );
};
