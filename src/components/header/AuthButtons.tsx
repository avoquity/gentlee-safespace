
import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { signOut } from '@/components/auth/services/authService';

interface AuthButtonsProps {
  className?: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ className = '' }) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Debug to check what authentication state we have
  useEffect(() => {
    console.log("AuthButtons rendering with:", {
      userExists: !!user,
      userEmail: user?.email,
      sessionExists: !!session,
      isLoading: loading,
      isOnHomePage: location.pathname === '/'
    });
  }, [user, session, loading, location.pathname]);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        throw error;
      }
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

  // Don't render buttons while auth is loading
  if (loading) {
    return null;
  }

  return (
    <>
      {user ? (
        <>
          <Link 
            to="/"
            onClick={handleSignOut}
            className={`text-deep-charcoal hover:text-muted-sage transition-colors duration-200 font-poppins text-base ${className}`}
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
};

export default AuthButtons;
