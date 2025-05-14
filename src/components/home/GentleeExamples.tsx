
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const exampleImages = [
  "/lovable-uploads/fe61adc7-6bea-4ca0-95fa-bb4b9e80d466.png",
  "/lovable-uploads/875b1f8f-71f0-4eee-8ee8-2bdcde64987f.png",
  "/lovable-uploads/4bbc778e-4475-4fb3-a835-a4acad652ccc.png",
  // You can add a fourth image here when available
];

interface GentleeExamplesProps {
  scrollToInput: () => void;
}

const GentleeExamples = ({ scrollToInput }: GentleeExamplesProps) => {
  return (
    <div className="w-full max-w-[95rem] mx-auto py-16 px-1 sm:px-2">
      <div className="text-center">
        {/* New "Gentlee moments" badge above title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="bg-white bg-opacity-50 inline-block px-4 py-1.5 rounded-full">
            <p className="text-xs font-medium uppercase tracking-wider text-dark-accent/70">
              Gentlee moments
            </p>
          </div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl mb-6 text-deep-charcoal font-playfair font-medium"
        >
          I just want to talk, not seek the answers of the universe.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-deep-charcoal/80 font-montserrat mb-12 max-w-3xl mx-auto"
        >
          A glimpse of the small, heart-level chats people have with Gentlee every day.
        </motion.p>
        
        {/* Carousel with reduced size (75%) and border/shadow */}
        <div className="max-w-3xl mx-auto mb-12">
          <Carousel opts={{ loop: true, align: "center", duration: 50 }} autoplay={true} interval={6000}>
            <CarouselContent>
              {exampleImages.map((src, index) => (
                <CarouselItem key={index} className="md:basis-3/4">
                  <AspectRatio ratio={16/9} className="bg-white bg-opacity-80 rounded-lg overflow-hidden border-2 border-muted-sage shadow-md">
                    <div className="w-[75%] h-[75%] mx-auto flex items-center justify-center">
                      <img 
                        src={src} 
                        alt={`Gentlee conversation example ${index + 1}`} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 sm:-left-12" />
            <CarouselNext className="right-2 sm:-right-12" />
          </Carousel>
        </div>
        
        {/* Button with primary style and rounded corners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Button 
            onClick={scrollToInput}
            className="bg-dark-accent hover:bg-dark-accent/90 text-white px-8 py-6 h-auto text-lg rounded-full transition-colors shadow-sm"
          >
            Start your free chat
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default GentleeExamples;
