
import React from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavLinksProps {
  className?: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <>
      {isMobile && (
        <Link to="/" className={`text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-playfair ${className}`}>
          Home
        </Link>
      )}
      <Link to="/about" className={`text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-playfair ${className}`}>
        About
      </Link>
      <a 
        href="https://lumi-studios.canny.io/feature-requests" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-playfair ${className}`}
      >
        Feature Requests
      </a>
    </>
  );
};

export default NavLinks;
