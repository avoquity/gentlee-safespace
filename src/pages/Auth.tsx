
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { AuthForm } from '@/components/auth/AuthForm';

const Auth = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for auth state changes to detect verification
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // If user is verified and signs in, redirect
          handleSuccessfulAuth();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSuccessfulAuth = () => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      sessionStorage.removeItem('pendingMessage');
      navigate('/chat', { state: { initialMessage: pendingMessage } });
    } else {
      navigate(location.state?.redirectTo || '/');
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md animate-fade-in">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        <AuthForm 
          isOpen={isOpen} 
          onOpenChange={setIsOpen} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
