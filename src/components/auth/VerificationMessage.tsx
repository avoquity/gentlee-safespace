
import React from 'react';
import { Button } from "@/components/ui/button";
import { NavigateFunction } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface VerificationMessageProps {
  email: string;
  canResendVerification: boolean;
  resendCountdown: number;
  setVerificationSent: (sent: boolean) => void;
  setCanResendVerification: (can: boolean) => void;
  setResendCountdown: (count: number) => void;
  navigate: NavigateFunction;
}

export const VerificationMessage = ({ 
  email,
  canResendVerification, 
  resendCountdown,
  setVerificationSent,
  setCanResendVerification,
  setResendCountdown,
  navigate
}: VerificationMessageProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!canResendVerification) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password: '******', // The password is required but won't be used in this context
        options: {
          data: {
            first_name: '',
            last_name: ''
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email resent",
        description: "Please check your inbox"
      });
      
      // Reset the countdown
      setCanResendVerification(false);
      setResendCountdown(30);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-4">
      <h2 className="text-2xl font-bold text-deep-charcoal mb-2">Almost there!</h2>
      <p className="text-deep-charcoal">
        Please check your email to verify your account. Once verified, you'll be redirected to your homepage where you can start chatting.
      </p>
      {canResendVerification ? (
        <Button 
          onClick={handleResendVerification} 
          variant="outline" 
          className="w-full mt-4"
        >
          Resend verification email
        </Button>
      ) : (
        <Button 
          variant="outline" 
          disabled 
          className="w-full mt-4 opacity-70"
        >
          Resend in {resendCountdown}s
        </Button>
      )}
      <div className="mt-8 text-sm text-center text-gray-500">
        <button 
          onClick={() => {
            setVerificationSent(false);
            navigate('/');
          }}
          className="text-muted-sage hover:underline"
        >
          I'll verify later
        </button>
      </div>
    </div>
  );
};

// Add missing import
import { useState } from 'react';
