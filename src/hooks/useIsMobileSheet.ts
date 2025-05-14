
import { useState, useEffect } from 'react';

// Track window size for responsive modal (mobile/tablet style)
export function useIsMobileSheet() {
  const [isSheet, setIsSheet] = useState(false);
  
  useEffect(() => {
    function update() {
      setIsSheet(window.innerWidth < 1024);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  
  return isSheet;
}
