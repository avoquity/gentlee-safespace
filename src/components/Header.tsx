
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import NavLinks from './header/NavLinks';
import AuthButtons from './header/AuthButtons';
import MobileHeader from './header/MobileHeader';
import DesktopHeader from './header/DesktopHeader';

const Header = () => {
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true);
      } else if (currentScrollY > lastScrollY) {
        setIsScrollingUp(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Component functions for reuse
  const renderNavLinks = () => <NavLinks />;
  const renderAuthButtons = () => <AuthButtons />;

  return (
    <header 
      className={`fixed top-0 w-full z-50 ${
        isScrollingUp ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
      style={{ transition: 'transform 300ms, box-shadow 300ms' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {isMobile ? (
            <MobileHeader 
              user={user}
              toggleMobileMenu={toggleMobileMenu}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              renderNavLinks={renderNavLinks}
              renderAuthButtons={renderAuthButtons}
            />
          ) : (
            <DesktopHeader 
              renderNavLinks={renderNavLinks}
              renderAuthButtons={renderAuthButtons}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
