
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { SignUpFormFields } from './SignUpFormFields';
import { SocialSignIn } from './SocialSignIn';
import { useFormValidation } from './utils/formValidation';
import { signUpWithEmail } from './services/authService';

interface SignUpFormProps {
  email: string;
  setEmail: (email: string) => void;
  handleSignInInstead: () => void;
  setVerificationSent: (sent: boolean) => void;
  setCanResendVerification: (can: boolean) => void;
  setResendCountdown: (count: number) => void;
}

export const SignUpForm = ({ 
  email, 
  setEmail, 
  handleSignInInstead,
  setVerificationSent,
  setCanResendVerification,
  setResendCountdown 
}: SignUpFormProps) => {
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const {
    termsError, setTermsError,
    emailError, setEmailError,
    emailAttempts, setEmailAttempts
  } = useFormValidation(agreeToTerms);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    setEmailError('');
    
    if (!agreeToTerms) {
      setTermsError('Please agree to the Terms & Conditions to continue.');
      return;
    }

    try {
      setLoading(true);
      
      const { error, emailAlreadyRegistered, data } = await signUpWithEmail(email, password, name);
      
      // Check for email already registered error
      if (emailAlreadyRegistered) {
        // Increment attempts counter
        const newAttempts = emailAttempts + 1;
        setEmailAttempts(newAttempts);
        
        // Check if multiple attempts
        if (newAttempts >= 3) {
          setEmailError('Something went wrong. Please try signing in or resetting your password.');
        } else {
          setEmailError('This email is already registered. Try signing in instead or reset your password.');
        }
        return;
      }
      
      if (error) throw error;
      
      // Set verification sent state to show the verification message
      setVerificationSent(true);
      
      // Start the countdown for resend button
      setResendCountdown(30);
      setCanResendVerification(false);
      
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
    <form onSubmit={handleSignUp} className="space-y-4">
      <h2 className="text-2xl font-bold text-deep-charcoal mb-6">Join us</h2>
      
      <SignUpFormFields 
        name={name}
        setName={setName}
        email={email}
        setEmail={(value) => {
          setEmail(value);
          setEmailError(''); // Clear error when user types
        }}
        password={password}
        setPassword={setPassword}
        agreeToTerms={agreeToTerms}
        setAgreeToTerms={setAgreeToTerms}
        emailError={emailError}
        termsError={termsError}
        handleSignInInstead={handleSignInInstead}
      />
      
      <Button 
        type="submit" 
        className={cn(
          "w-full bg-black text-white hover:bg-black/90",
          email && password && name && agreeToTerms && "!bg-[#A8BFA5] hover:!bg-[#A8BFA5]/90"
        )} 
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>

      <SocialSignIn loading={loading} setLoading={setLoading} />
    </form>
  );
};
