
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Lightbulb, ArrowRight, Sparkles } from 'lucide-react';

interface GuidedFirstConversationProps {
  onStarterClick: (text: string) => void;
  onSkip: () => void;
  isVisible: boolean;
}

export const GuidedFirstConversation = ({ 
  onStarterClick, 
  onSkip, 
  isVisible 
}: GuidedFirstConversationProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const guidedStarters = [
    {
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      category: "What's weighing on you",
      text: "Something's been on my mind lately and I'm not sure how to process it...",
      description: "Share what's currently occupying your thoughts"
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-blue-500" />,
      category: "How you're feeling right now",
      text: "I'm feeling a mix of emotions today and could use some clarity...",
      description: "Explore your current emotional state"
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
      category: "Something you're trying to understand",
      text: "I keep having this pattern in my relationships and I wonder why...",
      description: "Reflect on patterns or situations you'd like insight on"
    }
  ];

  const welcomeSteps = [
    {
      title: "Welcome to your safe space",
      subtitle: "A place to think out loud without judgment",
      content: "This is where you can explore your thoughts and feelings at your own pace. There's no right or wrong way to start."
    },
    {
      title: "How this works",
      subtitle: "Think of this as talking to a wise, caring friend",
      content: "Share whatever feels important to you right now. The conversation will naturally unfold based on what you need to explore."
    },
    {
      title: "Ready to begin?",
      subtitle: "Choose a starting point that resonates with you",
      content: "Here are some gentle ways to open up your first conversation:"
    }
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl mx-auto mb-8"
      >
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            {currentStep < 3 ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-gentle-sage/60" />
                  </div>
                  <h2 className="text-2xl font-montserrat text-deep-charcoal">
                    {welcomeSteps[currentStep].title}
                  </h2>
                  <p className="text-lg text-deep-charcoal/70 font-montserrat">
                    {welcomeSteps[currentStep].subtitle}
                  </p>
                </div>
                
                <p className="text-deep-charcoal/80 leading-relaxed max-w-md mx-auto">
                  {welcomeSteps[currentStep].content}
                </p>

                <div className="flex justify-center gap-3">
                  {currentStep < 2 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="bg-gentle-sage hover:bg-gentle-sage/90 text-white px-6 py-2 rounded-full"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setCurrentStep(3)}
                      className="bg-gentle-sage hover:bg-gentle-sage/90 text-white px-6 py-2 rounded-full"
                    >
                      See conversation starters
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-deep-charcoal/60 hover:text-deep-charcoal"
                  >
                    Skip guide
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-montserrat text-deep-charcoal">
                    Choose your starting point
                  </h3>
                  <p className="text-deep-charcoal/70">
                    Pick whichever feels most natural to you right now
                  </p>
                </div>

                <div className="space-y-4">
                  {guidedStarters.map((starter, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => onStarterClick(starter.text)}
                        className="w-full p-4 text-left border border-gentle-sage/20 rounded-lg hover:border-gentle-sage/40 hover:bg-gentle-sage/5 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{starter.icon}</div>
                          <div className="flex-1 space-y-1">
                            <div className="font-medium text-deep-charcoal text-sm">
                              {starter.category}
                            </div>
                            <div className="text-deep-charcoal/80 italic">
                              "{starter.text}"
                            </div>
                            <div className="text-xs text-deep-charcoal/60">
                              {starter.description}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gentle-sage/60 group-hover:text-gentle-sage transition-colors mt-2" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="text-deep-charcoal/60 hover:text-deep-charcoal text-sm"
                  >
                    Or start with your own message
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
