
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Header = () => {
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "Come back soon!"
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <header 
      className={`fixed top-0 w-full z-50 ${
        isScrollingUp ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
      style={{ transition: 'transform 300ms, box-shadow 300ms' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link to="/" className="text-deep-charcoal font-montserrat font-bold text-2xl">
              Gentlee
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-10">
            <Link to="/entries" className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins">
              Wall of Love
            </Link>
            <Link to="/about" className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins">
              About
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  onClick={() => navigate('/entries')}
                  variant="outline"
                  className="px-6 py-2 rounded-full border-2 border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:border-muted-sage hover:text-white"
                >
                  My Thoughts
                </Button>
                <Link 
                  to="/"
                  onClick={handleSignOut}
                  className="text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins"
                >
                  Sign Out
                </Link>
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
