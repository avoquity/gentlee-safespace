import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { VerificationMessage } from './VerificationMessage';

interface AuthFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthForm = ({ isOpen, onOpenChange }: AuthFormProps) => {
  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const defaultTab = location.state?.tab || 'signin';
  const redirectTo = location.state?.redirectTo || '/';

  // Handle tab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

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

  // Handle "Sign in instead" link click
  const handleSignInInstead = () => {
    // Switch to sign in tab
    setActiveTab('signin');
    // Keep the email filled in
    navigate('/auth', { state: { tab: 'signin', prefillEmail: email, redirectTo } });
  };

  // This forces the modal to stay open until user verifies
  const handleDialogOpenChange = (open: boolean) => {
    if (verificationSent) {
      // If verification message is showing, don't allow closing
      onOpenChange(true);
    } else {
      onOpenChange(open);
      if (!open) {
        navigate('/');
      }
    }
  };

  if (verificationSent) {
    return (
      <VerificationMessage
        email={email}
        canResendVerification={canResendVerification}
        resendCountdown={resendCountdown}
        setVerificationSent={setVerificationSent}
        setCanResendVerification={setCanResendVerification}
        setResendCountdown={setResendCountdown}
        navigate={navigate}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <ForgotPasswordForm
        email={email} 
        setEmail={setEmail}
        setShowForgotPassword={setShowForgotPassword}
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <SignInForm
          email={email}
          setEmail={setEmail}
          redirectTo={redirectTo}
          setShowForgotPassword={setShowForgotPassword}
        />
      </TabsContent>

      <TabsContent value="signup">
        <SignUpForm
          email={email}
          setEmail={setEmail}
          handleSignInInstead={handleSignInInstead}
          setVerificationSent={setVerificationSent}
          setCanResendVerification={setCanResendVerification}
          setResendCountdown={setResendCountdown}
        />
      </TabsContent>
    </Tabs>
  );
};
