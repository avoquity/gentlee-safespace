
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { cn } from "@/lib/utils";

interface SignInFormProps {
  email: string;
  setEmail: (email: string) => void;
  redirectTo: string;
  setShowForgotPassword: (show: boolean) => void;
}

export const SignInForm = ({ 
  email, 
  setEmail, 
  redirectTo,
  setShowForgotPassword 
}: SignInFormProps) => {
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('rememberMe') === 'true';
  });
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle "Remember Me" persistence
  useEffect(() => {
    // Check if we should prefill from localStorage
    if (localStorage.getItem('rememberMe') === 'true') {
      const savedEmail = localStorage.getItem('userEmail');
      if (savedEmail) setEmail(savedEmail);
      // Never restore password for security reasons
    }
  }, [setEmail]);

  // Save credentials if "Remember Me" is checked
  useEffect(() => {
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('userEmail', email);
      // We no longer store password for security reasons
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');
    }
  }, [rememberMe, email]);

  const handleSuccessfulAuth = () => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      navigate('/chat', { state: { initialMessage: pendingMessage } });
    } else {
      navigate(redirectTo);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      handleSuccessfulAuth();
    } catch (error: any) {
      // Show inline error message
      setEmailError('Invalid login credentials. Please check your email and password.');
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
    <form onSubmit={handleSignIn} className="space-y-4">
      <h2 className="text-2xl font-bold text-deep-charcoal mb-6">Welcome back!</h2>
      <div className="space-y-2">
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
            <p className="text-red-500 text-sm">{emailError}</p>
          )}
        </div>
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setEmailError(''); // Clear error when user types
          }}
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <label htmlFor="remember" className="text-sm text-deep-charcoal">
            Save my details
          </label>
        </div>
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-dusty-rose hover:underline"
        >
          Forgot password?
        </button>
      </div>
      <Button 
        type="submit" 
        className={cn(
          "w-full bg-black text-white hover:bg-black/90",
          email && password && "!bg-[#A8BFA5] hover:!bg-[#A8BFA5]/90"
        )} 
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
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
        {loading ? 'Please wait...' : 'Sign in with Google'}
      </Button>
    </form>
  );
};
