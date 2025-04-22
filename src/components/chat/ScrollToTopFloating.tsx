
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScrollToTopFloatingProps {
  scrollContainer?: React.RefObject<HTMLElement>;
}

export const ScrollToTopFloating: React.FC<ScrollToTopFloatingProps> = ({
  scrollContainer
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainer?.current) return;

      const container = scrollContainer.current;
      const scrollHeight = container.scrollHeight;
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      
      // Show button when scrolled down 100px or more from top
      setIsVisible(scrollTop > 100);
      
      // Add console log for debugging scroll position
      console.log({
        scrollTop,
        scrollHeight,
        clientHeight,
        isVisible: scrollTop > 100
      });
    };

    const el = scrollContainer?.current;
    if (!el) return;
    
    el.addEventListener("scroll", handleScroll, { passive: true });

    // Run once for initial state
    handleScroll();

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainer]);

  const handleClick = () => {
    if (scrollContainer?.current) {
      scrollContainer.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <TooltipProvider>
      <div
        aria-hidden={!isVisible}
        className={cn(
          "pointer-events-none fixed bottom-24 left-0 right-0 z-[1000] flex justify-center",
          "transition-opacity duration-300 ease-in-out",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Scroll to top"
              onClick={handleClick}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                "bg-deep-charcoal text-white shadow-lg",
                "transition-all duration-300 ease-in-out",
                "hover:bg-opacity-90 hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isVisible ? "translate-y-0" : "translate-y-10"
              )}
              tabIndex={isVisible ? 0 : -1}
            >
              <ArrowUp className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Scroll to top</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
