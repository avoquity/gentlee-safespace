
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Heart, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSavedInsights } from '@/hooks/useSavedInsights';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface InsightCardProps {
  insight: string;
  isPersonalized?: boolean;
  personalizedInsightId?: string;
}

export const InsightCard = ({ 
  insight, 
  isPersonalized = false, 
  personalizedInsightId 
}: InsightCardProps) => {
  const { saveInsight, checkIfInsightSaved, isSaving } = useSavedInsights();
  const { wisdomLibrary } = useFeatureFlags();
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  useEffect(() => {
    const checkSaved = async () => {
      if (wisdomLibrary) {
        const saved = await checkIfInsightSaved(insight);
        setIsAlreadySaved(saved);
      }
    };
    checkSaved();
  }, [insight, checkIfInsightSaved, wisdomLibrary]);

  const handleSaveInsight = async () => {
    const success = await saveInsight(
      insight,
      isPersonalized ? 'personalized' : 'generic',
      personalizedInsightId
    );
    
    if (success) {
      setIsAlreadySaved(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="my-6"
    >
      <Card className="border-gentle-sage/30 bg-gradient-to-br from-gentle-sage/5 to-gentle-sage/10 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gentle-sage/20 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-gentle-sage" />
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gentle-sage">
                    {isPersonalized ? 'Personal Insight' : 'Insight'}
                  </span>
                  {isPersonalized && (
                    <span className="text-xs bg-gentle-sage/20 text-gentle-sage px-2 py-1 rounded-full">
                      Tailored for you
                    </span>
                  )}
                </div>
                <blockquote className="text-deep-charcoal/90 leading-relaxed italic">
                  "{insight}"
                </blockquote>
              </div>

              {wisdomLibrary && (
                <div className="flex items-center justify-end">
                  {isAlreadySaved ? (
                    <div className="flex items-center gap-2 text-sm text-gentle-sage">
                      <Check className="w-4 h-4" />
                      Saved to library
                    </div>
                  ) : (
                    <Button
                      onClick={handleSaveInsight}
                      disabled={isSaving}
                      variant="ghost"
                      size="sm"
                      className="text-gentle-sage hover:text-gentle-sage/80 hover:bg-gentle-sage/10"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save to library'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
