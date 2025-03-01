import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('rememberMe') === 'true';
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailAttempts, setEmailAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const defaultTab = location.state?.tab || 'signin';
  const redirectTo = location.state?.redirectTo || '/';

  // Handle tab changes
  useEffect(() => {
    setActiveTab(defaultTab);
    // Clear any errors when switching tabs
    setEmailError('');
    setTermsError('');
    
    // Clear signup form fields when switching to signup tab
    if (defaultTab === 'signup') {
      setName('');
      
      // Don't prefill email/password from saved credentials on signup tab
      if (!location.state?.prefillEmail) {
        setEmail('');
      } else {
        // If we're coming from "sign in instead" link, prefill the email
        setEmail(location.state.prefillEmail);
      }
      setPassword('');
    }
  }, [defaultTab, location.state]);

  // Handle "Remember Me" persistence
  useEffect(() => {
    // Check if we should prefill from localStorage (only for signin tab)
    if (activeTab === 'signin' && localStorage.getItem('rememberMe') === 'true') {
      const savedEmail = localStorage.getItem('userEmail');
      
      if (savedEmail) setEmail(savedEmail);
      // Never restore password for security reasons
    }
  }, [activeTab]);

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

  // Timer for resend verification button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (verificationSent && !canResendVerification) {
      timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResendVerification(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [verificationSent, canResendVerification]);

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

  // Clear terms error when checkbox is checked
  useEffect(() => {
    if (agreeToTerms) {
      setTermsError('');
    }
  }, [agreeToTerms]);

  const handleSuccessfulAuth = () => {
    const pendingMessage = sessionStorage.getItem('pendingMessage');
    if (pendingMessage) {
      sessionStorage.removeItem('pendingMessage');
      navigate('/chat', { state: { initialMessage: pendingMessage } });
    } else {
      navigate(redirectTo);
    }
    setIsOpen(false);
  };

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
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' ')
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

  const handleResendVerification = async () => {
    if (!canResendVerification) return;
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: name.split(' ')[0],
            last_name: name.split(' ').slice(1).join(' ')
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link."
      });
      setShowForgotPassword(false);
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

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook' | 'twitter') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignInWithGoogle = () => handleSocialLogin('google');

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Clear form fields and errors when switching to signup tab
    if (value === 'signup') {
      setName('');
      // Don't clear email if we're switching from "sign in instead" link
      if (!location.state?.prefillEmail) {
        setEmail('');
      }
      setPassword('');
      setEmailError('');
      setTermsError('');
    }
  };

  // This forces the modal to stay open until user verifies
  const handleDialogOpenChange = (open: boolean) => {
    if (verificationSent) {
      // If verification message is showing, don't allow closing
      setIsOpen(true);
    } else {
      setIsOpen(open);
      if (!open) {
        navigate('/');
      }
    }
  };

  // Handle "Sign in instead" link click
  const handleSignInInstead = () => {
    // Switch to sign in tab
    setActiveTab('signin');
    // Keep the email filled in
    // Don't pass the password for security
    navigate('/auth', { state: { tab: 'signin', prefillEmail: email, redirectTo } });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md animate-fade-in">
        {verificationSent ? (
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
                  setIsOpen(false);
                  navigate('/');
                }}
                className="text-muted-sage hover:underline"
              >
                I'll verify later
              </button>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <h2 className="text-2xl font-bold text-deep-charcoal mb-6">Welcome back!</h2>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
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
                            onClick={() => setShowForgotPassword(true)}
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
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Reset Password</h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Auth;
