
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-deep-charcoal mb-10 text-center">
        Your questions - Our answers
      </h2>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b border-deep-charcoal/20">
          <AccordionTrigger className="text-left font-poppins text-lg md:text-xl text-deep-charcoal py-4 hover:no-underline">
            Can I try Gentlee for free?
          </AccordionTrigger>
          <AccordionContent className="text-base md:text-lg font-poppins text-deep-charcoal/80 pt-2 pb-6 leading-relaxed">
            Yes! Gentlee is free forever with the Gentle Start plan, which gives you 3 messages per week and memory retention for 14 days. Your message count resets on the 7th day at 12 AM so you can start fresh.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-b border-deep-charcoal/20">
          <AccordionTrigger className="text-left font-poppins text-lg md:text-xl text-deep-charcoal py-4 hover:no-underline">
            What's included in the Reflection plan?
          </AccordionTrigger>
          <AccordionContent className="text-base md:text-lg font-poppins text-deep-charcoal/80 pt-2 pb-6 leading-relaxed">
            <p>Reflection is for those who want deeper, uninterrupted conversations. It includes:</p>
            <ul className="list-none space-y-2 mt-3">
              <li>200 messages per month</li>
              <li>Memory retention for 12 months</li>
              <li>Future features such as Voice activation (coming soon)</li>
              <li>Reflection plan price is $18.88/month. You can also get it for an entire year to get 2 months free ($188.88/year).</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border-b border-deep-charcoal/20">
          <AccordionTrigger className="text-left font-poppins text-lg md:text-xl text-deep-charcoal py-4 hover:no-underline">
            What is the early adopter's price lock?
          </AccordionTrigger>
          <AccordionContent className="text-base md:text-lg font-poppins text-deep-charcoal/80 pt-2 pb-6 leading-relaxed">
            <p>We're offering free lifetime access to the first 20 people, and 50% off for life for the next 50 people. After that, it's regular pricing.</p>
            <ul className="list-disc list-inside space-y-2 mt-3 ml-4">
              <li>For our early adopters, your price stays the same even when we increase our monthly fees in the future, with more features added.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border-b border-deep-charcoal/20">
          <AccordionTrigger className="text-left font-poppins text-lg md:text-xl text-deep-charcoal py-4 hover:no-underline">
            How is payment handled?
          </AccordionTrigger>
          <AccordionContent className="text-base md:text-lg font-poppins text-deep-charcoal/80 pt-2 pb-6 leading-relaxed">
            All payments are securely processed through Stripe, a trusted global payment provider. You can pay with credit or debit card, and your plan renews automatically each month or year based on your selection.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border-b border-deep-charcoal/20">
          <AccordionTrigger className="text-left font-poppins text-lg md:text-xl text-deep-charcoal py-4 hover:no-underline">
            Can I cancel anytime?
          </AccordionTrigger>
          <AccordionContent className="text-base md:text-lg font-poppins text-deep-charcoal/80 pt-2 pb-6 leading-relaxed">
            Yes! You can cancel your plan anytime in your account settings, and your subscription will not renew at the next billing cycle. There are no hidden fees or lock-ins.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FAQSection;
