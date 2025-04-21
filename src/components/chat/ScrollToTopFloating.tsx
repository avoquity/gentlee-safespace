
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

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
      // Show button if user has scrolled down a bit (use lower threshold to show button more readily)
      setIsVisible(container.scrollTop > 100);
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
    <div
      aria-hidden={!isVisible}
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 flex justify-center"
    >
      <button
        type="button"
        aria-label="Scroll to top"
        onClick={handleClick}
        className={cn(
          "flex h-12 w-12 min-h-11 min-w-11 items-center justify-center rounded-full bg-white shadow-lg",
          "transition-all duration-300 ease-in-out hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "mb-28 transform",
          isVisible ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none translate-y-10"
        )}
        tabIndex={isVisible ? 0 : -1}
      >
        <ArrowUp className="text-black" size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};
