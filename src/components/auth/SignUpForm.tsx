
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { cn } from "@/lib/utils";

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
  const [termsError, setTermsError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailAttempts, setEmailAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Clear terms error when checkbox is checked
  useEffect(() => {
    if (agreeToTerms) {
      setTermsError('');
    }
  }, [agreeToTerms]);

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
      
      // Split the full name into first name and last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: name.trim()
          }
        }
      });
      
      // Check for email already registered error
      if (error?.message?.includes('already registered') || 
         (data?.user && data?.user?.identities?.length === 0)) {
        
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

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      // Get the current domain for proper redirection
      const redirectUrl = window.location.origin + '/auth/callback';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
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
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(''); // Clear error when user types
            }}
            className={emailError ? "border-red-500" : ""}
            required
          />
          {emailError && (
            <div className="space-y-2">
              <p className="text-red-500 text-sm">{emailError}</p>
              <div className="flex gap-4 text-sm">
                <button 
                  type="button" 
                  onClick={handleSignInInstead}
                  className="text-dusty-rose hover:underline"
                >
                  Sign in instead
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    // We'll handle this in the parent component
                    // but keep the button for consistency
                  }}
                  className="text-dusty-rose hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          )}
        </div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="terms"
            checked={agreeToTerms}
            onCheckedChange={(checked) => {
              setAgreeToTerms(checked as boolean);
              if (checked) setTermsError('');
            }}
          />
          <label htmlFor="terms" className="text-sm text-deep-charcoal">
            I agree with the Terms and Privacy Policy
          </label>
        </div>
        {termsError && (
          <p className="text-red-500 text-sm ml-6">{termsError}</p>
        )}
      </div>
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleSignInWithGoogle}
        className="w-full"
        disabled={loading}
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
          />
        </svg>
        {loading ? 'Please wait...' : 'Sign up with Google'}
      </Button>
    </form>
  );
};
