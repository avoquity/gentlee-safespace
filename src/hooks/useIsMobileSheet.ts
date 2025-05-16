
import { useState, useEffect } from 'react';

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
