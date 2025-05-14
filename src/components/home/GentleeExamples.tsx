import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
const exampleImages = ["/lovable-uploads/fe61adc7-6bea-4ca0-95fa-bb4b9e80d466.png", "/lovable-uploads/875b1f8f-71f0-4eee-8ee8-2bdcde64987f.png", "/lovable-uploads/4bbc778e-4475-4fb3-a835-a4acad652ccc.png"
// You can add a fourth image here when available
];
interface GentleeExamplesProps {
  scrollToInput: () => void;
}
const GentleeExamples = ({
  scrollToInput
}: GentleeExamplesProps) => {
  return <div className="w-full max-w-[95rem] mx-auto py-16 px-1 sm:px-2">
      <div className="text-center">
        {/* "Gentlee moments" badge above title */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="mb-6">
          <div className="inline-block px-4 py-1.5 rounded-full">
            <p className="text-xs font-medium uppercase tracking-wider text-dark-accent/70">
              Gentlee moments
            </p>
          </div>
        </motion.div>
        
        <motion.h2 initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="text-4xl sm:text-5xl mb-6 text-deep-charcoal font-playfair font-medium">
          I just want to talk, not seek the answers of the universe.
        </motion.h2>
        
        <motion.p initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.1
      }} className="text-xl text-deep-charcoal/80 font-montserrat mb-12 max-w-3xl mx-auto">We often don't need advice. We just need a safe space for our thoughts so we can process them, and reconnect with our inner world.</motion.p>
        
        {/* Carousel with enlarged screenshots - larger size for better readability */}
        <div className="max-w-4xl mx-auto mb-12 px-4">
          <Carousel opts={{
          loop: true,
          align: "center",
          duration: 50
        }} autoplay={true} interval={15000}>
            <CarouselContent>
              {exampleImages.map((src, index) => <CarouselItem key={index} className="md:basis-full">
                  <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden border-2 border-muted-sage shadow-md">
                    <div className="w-full h-full flex items-center justify-center py-2">
                      <img src={src} alt={`Gentlee conversation example ${index + 1}`} className="w-[85%] md:w-[85%] h-auto object-contain max-h-full" />
                    </div>
                  </AspectRatio>
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="left-2 sm:-left-12" />
            <CarouselNext className="right-2 sm:-right-12" />
          </Carousel>
        </div>
        
        {/* Button with flatter height */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }}>
          <Button onClick={scrollToInput} className="bg-dark-accent hover:bg-dark-accent/90 text-white px-8 py-4 h-auto text-lg rounded-full transition-colors shadow-sm">
            Start your free chat
          </Button>
        </motion.div>
      </div>
    </div>;
};
export default GentleeExamples;