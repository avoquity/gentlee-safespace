
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

// Updated FAQ data array with new copy
const faqData = [
  {
    question: "🌿 Is my conversation really private?",
    answer: "Absolutely. Every word you share is wrapped in end-to-end encryption and stays only between you and Gentlee. We'll never sell, trade, or peek at your thoughts for marketing—pinkie promise. Your chat history lives on our secure servers solely so Gentlee can remember the little things that matter to you."
  },
  {
    question: "🌿 Can I chat in my native language?",
    answer: "Yes, please do! Whether you think in English, Vietnamese, Spanish, or emoji­-sprinkled Hinglish, just start typing and Gentlee will meet you there. No toggles, no setup—your language, your pace, your voice."
  },
  {
    question: "🌿 Is Gentlee a replacement for therapy?",
    answer: "Gentlee is like a caring friend steeped in gentle psychology—not a licensed therapist. It's perfect for everyday reflection, pattern-spotting, and those \"just need to breathe\" moments. But deep trauma, crisis, or clinical diagnoses deserve professional help. Think of Gentlee as an extra layer of support you can reach for between therapy sessions—or when therapy isn't an option right now."
  },
  {
    question: "🌿 Can I try Gentlee for free?",
    answer: "Yes! Gentlee is free forever with the Gentle Start plan, which gives you 3 messages per week and memory retention for 14 days. Your message count resets every Sunday at 12 AM so you can start fresh."
  },
  {
    question: "🌿 What's included in the Reflection plan?",
    answer: <>
      <p className="mb-2">Reflection is for those who want deeper, uninterrupted conversations. It includes:</p>
      <ul className="list-disc pl-5 mb-3">
        <li>✅ 200 messages per month</li>
        <li>✅ Memory retention for 12 months</li>
        <li>✅ Future features such as Voice activation (coming soon)</li>
        <li>💰 Pricing: $18.88/month OR $188.88/year (2 months free).</li>
      </ul>
    </>
  },
  {
    question: "🌿 What is the early adopter's price lock?",
    answer: <>
      <p className="mb-2">We're offering exclusive discounts for our first supporters!</p>
      <ul className="list-disc pl-5 mb-3">
        <li>The first 20 users get Gentlee free for life.</li>
        <li>The next 50 users get 50% off for life—this means you'll always pay $9.44/month or $94/year, even if the price increases later.</li>
      </ul>
    </>
  },
  {
    question: "🌿 How is payment handled?",
    answer: "All payments are securely processed through Stripe, a trusted global payment provider. You can pay with credit or debit card, and your plan renews automatically each month or year based on your selection."
  },
  {
    question: "🌿 Can I cancel anytime?",
    answer: "Yes! You can cancel your plan anytime in your account settings, and your subscription will not renew at the next billing cycle. There are no hidden fees or lock-ins."
  },
  {
    question: "🌿 How do I contact you?",
    answer: <>
      We'd love to hear from you—questions, hugs, bug reports, all of it. Drop us a note at <a href="mailto:hellolumistudios@gmail.com" className="text-dark-accent hover:underline">hellolumistudios@gmail.com</a> and we'll get back to you within a day (usually faster). Got feature ideas? Add them—or vote on others—at <a href="https://lumi-studios.canny.io/feature-requests" target="_blank" rel="noopener noreferrer" className="text-dark-accent hover:underline">Gentlee feature request page</a>. Your voice shapes Gentlee's future. 💛
    </>
  }
];

const FAQSection = () => {
  return (
    <div className="w-full max-w-[95rem] mx-auto py-16 px-1 sm:px-2 pt-20">
      <div className="text-center bg-warm-beige rounded-2xl p-8 sm:p-12">
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
                  <AccordionContent className="text-deep-charcoal/80 font-montserrat pt-2 text-lg">
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
