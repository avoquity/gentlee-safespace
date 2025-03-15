
import { supabase } from '@/integrations/supabase/client';
import { parseFullName } from '../utils/formValidation';

interface SignUpResult {
  error: Error | null;
  emailAlreadyRegistered: boolean;
  data: any;
}

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  name: string
): Promise<SignUpResult> => {
  const { firstName, lastName, fullName } = parseFullName(name);
  
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName
      },
      // Place persistSession within options
      persistSession: true
    }
  });
  
  const emailAlreadyRegistered = 
    error?.message?.includes('already registered') || 
    (data?.user && data?.user?.identities?.length === 0);
  
  return {
    error: error || null,
    emailAlreadyRegistered,
    data
  };
};

export const signInWithEmail = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      // Place persistSession within options
      persistSession: true
    }
  });
};

export const signInWithGoogle = async (redirectUrl: string) => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      // Place persistSession within options
      persistSession: true
    }
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut({
    scope: 'local' // Only sign out on this device
  });
};
