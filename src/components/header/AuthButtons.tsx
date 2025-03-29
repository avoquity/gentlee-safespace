
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';

interface AuthButtonsProps {
  className?: string;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {user ? (
        <>
          <UserMenu />
          
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
