
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, session: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the session from localStorage if available
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event);
      
      // When a user signs in, ensure their profile data is synced
      if (session?.user && (_event === 'SIGNED_IN' || _event === 'USER_UPDATED')) {
        try {
          // Get user metadata from the session
          const { user } = session;
          const metadata = user.user_metadata;
          
          // Check for Google specific fields or regular fields
          const firstName = metadata.first_name || metadata.given_name || '';
          const lastName = metadata.last_name || metadata.family_name || '';
          
          // Only update if we have name data
          if (firstName || lastName) {
            await supabase.from('profiles').upsert({
              id: user.id,
              first_name: firstName,
              last_name: lastName
            }, { onConflict: 'id' });
          }
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
