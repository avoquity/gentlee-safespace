
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
      const scrollTop = container.scrollTop;
      
      // Show button when scrolled down 50px or more from top (reduced from 100px for better visibility)
      setIsVisible(scrollTop > 50);
      
      // Add console log for debugging scroll position
      console.log("Scroll debug:", {
        scrollTop,
        isVisible: scrollTop > 50,
        containerRef: scrollContainer.current
      });
    };

    const el = scrollContainer?.current;
    if (!el) return;
    
    el.addEventListener("scroll", handleScroll, { passive: true });

    // Run once for initial state
    handleScroll();

    // Force visibility check after a brief delay to ensure detection works
    const timer = setTimeout(() => {
      handleScroll();
      console.log("Forced scroll check");
    }, 1000);

    return () => {
      el?.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, [scrollContainer]);

  const handleClick = () => {
    if (scrollContainer?.current) {
      scrollContainer.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // For testing: force visible during development
  // Remove this line in production
  // const isVisible = true;

  return (
    <TooltipProvider>
      <div
        aria-hidden={!isVisible}
        className={cn(
          "pointer-events-none fixed bottom-24 right-8 z-[1100] flex justify-center",
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
                "flex h-12 w-12 items-center justify-center rounded-full",
                "bg-deep-charcoal text-white shadow-lg",
                "transition-all duration-300 ease-in-out",
                "hover:bg-opacity-90 hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isVisible ? "translate-y-0" : "translate-y-10"
              )}
              tabIndex={isVisible ? 0 : -1}
            >
              <ArrowUp className="h-6 w-6" />
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
