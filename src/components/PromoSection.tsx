
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

// FAQ data array
const faqData = [
  {
    question: "Is my conversation really private?",
    answer: "Yes. We never sell or share your words with third parties—period. Your entries live on encrypted servers purely so Gentlee can gently 'remember,' spot patterns, and serve you better. You can export or delete your data any time in Settings."
  },
  {
    question: "What plans are available and how much do they cost?",
    answer: <>
      <p className="mb-2">Free Plan — "A Gentle Start" (forever free)</p>
      <ul className="list-disc pl-5 mb-3">
        <li>Up to 3 chats a week</li>
        <li>Basic theme recognition & daily reflection prompts</li>
      </ul>
      
      <p className="mb-2">Premium Plan — "Deeper Reflections" ($7.99 / month or $69 / year)</p>
      <ul className="list-disc pl-5 mb-3">
        <li>Unlimited chats</li>
        <li>Advanced pattern detection, voice notes, private journal insights, dark-mode UI, priority support, and more.</li>
      </ul>
      
      <p className="mb-1">🔖 Alpha-only promise: These prices are our Alpha launch rates. Join now and they're yours for life, even if we raise prices later.</p>
    </>
  },
  {
    question: "Is Gentlee a replacement for therapy?",
    answer: "No. Gentlee is a compassionate companion for everyday reflection, not a substitute for professional care. Use it for gentle check-ins, perspective shifts, and habit-forming prompts—but see a licensed therapist for trauma, crisis, or clinical diagnosis."
  },
  {
    question: "Can I chat in my native language?",
    answer: "Absolutely. Gentlee understands and replies in almost any language—just start typing and it will follow your lead."
  },
  {
    question: "What technology powers Gentlee?",
    answer: "Gentlee runs on OpenAI's GPT-4.1 engine, fine-tuned with evidence-based psychology prompts and our proprietary 'gentle mirror' guidance layer."
  },
  {
    question: "How does Gentlee \"remember\" me?",
    answer: "With your permission, it stores a history of past chats so it can recognise themes, track mood shifts, and offer deeper insights. We call this Personalised Memory (limited to your last 5 chats on the free plan, unlimited on Premium)."
  },
  {
    question: "What if I need immediate help?",
    answer: "If you ever feel unsafe or in crisis, please contact local emergency services or a qualified mental-health professional right away. Gentlee isn't equipped to handle emergencies."
  },
  {
    question: "What's on the roadmap?",
    answer: "Coming soon: Smart Check-Ins (AI-timed nudges when your mood drifts) and Self-Assurance on-the-go (bite-size grounding exercises for busy days). Have ideas? Add them—or vote—at lumi-studios.canny.io/feature-requests."
  },
  {
    question: "How do I give feedback or report a bug?",
    answer: "We're all ears. Email hellolumistudios@gmail.com and we'll reply within 24 hours on weekdays."
  },
  {
    question: "Will Gentlee judge me?",
    answer: "Never. Our goal is compassionate reflection, not advice-splaining or productivity guilt. You set the pace; Gentlee simply listens, connects dots, and hands the insight back to you."
  }
];

const FAQSection = () => {
  return (
    <div className="w-full max-w-[95rem] mx-auto py-16 px-1 sm:px-2">
      <div className="text-center">
        <div className="bg-white bg-opacity-50 inline-block px-4 py-1.5 rounded-full mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-dark-accent/70">
            Clear answers
          </p>
        </div>
        
        <h2 className="text-3xl sm:text-4xl mb-12 text-deep-charcoal font-playfair">
          Your questions - Our answers
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="text-left">
            {faqData.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-0 border-b border-deep-charcoal/20 py-4"
              >
                <AccordionTrigger 
                  className="text-xl font-medium text-deep-charcoal hover:no-underline font-playfair py-2"
                >
                  {faq.question}
                </AccordionTrigger>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AccordionContent className="text-deep-charcoal/80 font-montserrat pt-2">
                    {faq.answer}
                  </AccordionContent>
                </motion.div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
