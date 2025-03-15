
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
      }
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
