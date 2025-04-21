
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

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
      // Show button if user is >130px from top, and has scrolled down
      setIsVisible(container.scrollTop > 130);
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
      aria-label="Scroll to top"
      className="pointer-events-none"
    >
      <button
        type="button"
        aria-label="Scroll to top"
        onClick={handleClick}
        className={`fixed left-1/2 z-40
          transition-all duration-300 ease-in-out 
          ${isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
        style={{
          bottom: '110px',
          transform: 'translateX(-50%)',
          width: 48,
          height: 48,
          minWidth: 44,
          minHeight: 44,
          border: "none",
          background: "#fff",
          borderRadius: "9999px",
          boxShadow: "0 6px 24px 0 rgba(46, 46, 46, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        tabIndex={isVisible ? 0 : -1}
      >
        <ArrowUp color="#9b87f5" size={28} strokeWidth={2} />
      </button>
    </div>
  );
};
