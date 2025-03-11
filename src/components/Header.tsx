
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileMenu from './MobileMenu';

const Header = () => {
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "Come back soon!"
      });
      // Clear saved credentials when user manually signs out
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Links shown in both desktop nav and mobile menu
  const renderNavLinks = () => (
    <>
      <Link to="/about" className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins">
        About
      </Link>
      <a 
        href="https://lumi-studios.canny.io/feature-requests" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins"
      >
        Feature Requests
      </a>
    </>
  );

  // Auth buttons shown in both desktop and mobile menu
  const renderAuthButtons = () => (
    <>
      {user ? (
        <>
          <Link 
            to="/"
            onClick={handleSignOut}
            className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins text-base"
          >
            Sign Out
          </Link>
          {location.pathname === '/' && (
            <Button
              onClick={() => navigate('/entries')}
              variant="outline"
              className="px-6 py-2 rounded-full border-2 border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:border-muted-sage hover:text-white text-base"
            >
              My thoughts
            </Button>
          )}
        </>
      ) : (
        <>
          <Button
            onClick={() => navigate('/auth', { state: { tab: 'signup' } })}
            className="px-6 py-2 rounded-full bg-deep-charcoal border-2 border-deep-charcoal text-white hover:bg-muted-sage hover:border-muted-sage"
          >
            Sign Up
          </Button>
          <Button
            onClick={() => navigate('/auth', { state: { tab: 'signin' } })}
            variant="outline"
            className="px-6 py-2 rounded-full border-2 border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:border-muted-sage hover:text-white"
          >
            Sign In
          </Button>
        </>
      )}
    </>
  );

  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 ${
          isScrollingUp ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
        style={{ transition: 'transform 300ms, box-shadow 300ms' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="text-deep-charcoal font-montserrat font-bold text-2xl">
              Gentlee
            </Link>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <>
                <nav className="flex items-center space-x-10">
                  {renderNavLinks()}
                </nav>
                
                <div className="flex items-center space-x-4">
                  {renderAuthButtons()}
                </div>
              </>
            )}
            
            {/* Mobile UI */}
            {isMobile && (
              <div className="flex items-center space-x-4">
                {!user && (
                  <Button
                    onClick={() => navigate('/auth', { state: { tab: 'signin' } })}
                    variant="outline"
                    className="px-6 py-2 rounded-full border-2 border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:border-muted-sage hover:text-white"
                  >
                    Sign In
                  </Button>
                )}
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-deep-charcoal focus:outline-none"
                  aria-label="Toggle menu"
                >
                  <Menu size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobile && (
        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
          renderNavLinks={renderNavLinks}
          renderAuthButtons={renderAuthButtons}
        />
      )}
    </>
  );
};

export default Header;
