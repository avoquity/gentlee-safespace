
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
          // If user is verified and signs in, ensure profile data is updated
          if (session.user) {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // If the profile doesn't exist or is missing name data, update it
            if (!existingProfile || !existingProfile.first_name) {
              const userData = session.user.user_metadata;
              const firstName = userData.first_name || userData.given_name || '';
              const lastName = userData.last_name || userData.family_name || '';
              
              // Update profile with names from metadata
              await supabase.from('profiles').upsert({
                id: session.user.id,
                first_name: firstName,
                last_name: lastName
              }, { onConflict: 'id' });
            }
          }
          
          // Then handle the successful authentication
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
      // Navigate to chat with the initial message as a state parameter
      navigate('/chat', { 
        state: { 
          initialMessage: pendingMessage,
          entryDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        } 
      });
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
