
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
    console.log("AuthProvider initializing...");
    
    // Set up persistent auth state using getSession
    const initializeSession = async () => {
      try {
        console.log("Checking for existing session...");
        
        // Get the current session from localStorage via Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        if (data?.session) {
          console.log("Found existing session:", data.session.user.email);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log("No existing session found on initialization");
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Initialize session when component mounts
    initializeSession();

    // Set up the auth state change listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email);
      
      // When a user signs in, ensure their profile data is synced
      if (newSession?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        try {
          // Get user metadata from the session
          const { user } = newSession;
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
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Add this to debug the current state
  useEffect(() => {
    console.log("AuthContext state updated:", {
      isAuthenticated: !!user,
      userEmail: user?.email,
      sessionExists: !!session
    });
  }, [user, session]);

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
