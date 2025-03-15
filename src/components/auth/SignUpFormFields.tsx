
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface SignUpFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  agreeToTerms: boolean;
  setAgreeToTerms: (agree: boolean) => void;
  emailError: string;
  termsError: string;
  handleSignInInstead: () => void;
}

export const SignUpFormFields = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  agreeToTerms,
  setAgreeToTerms,
  emailError,
  termsError,
  handleSignInInstead
}: SignUpFormFieldsProps) => {
  return (
    <div className="space-y-4">
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
            }}
            className={cn(emailError ? "border-red-500" : "")}
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
    </div>
  );
};
