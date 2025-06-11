
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  loading: true,
  logout: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Extract session handling logic to avoid race conditions
  const handleSessionChange = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user || null);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    console.log('AuthProvider mounting');
    
    // Add a flag to prevent race conditions
    let isMounted = true;
    
    // Set up auth state listener first to catch any auth events that happen during initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state change:', event);
      if (isMounted) {
        handleSessionChange(newSession);
        if (!initialized) setInitialized(true);
      }
    });

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) setLoading(false);
          return;
        }
        
        if (isMounted) {
          console.log('Initial session:', initialSession ? 'exists' : 'none');
          handleSessionChange(initialSession);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Initialize auth with a small delay to ensure subscription is set up first
    setTimeout(initializeAuth, 50);

    return () => {
      console.log('AuthProvider unmounting');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleSessionChange]);

  // Provide a fallback if initialization takes too long
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading && !initialized) {
        console.warn('Auth initialization timeout - forcing completion');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000); // 5 second safety timeout
    
    return () => clearTimeout(timeoutId);
  }, [loading, initialized]);

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
