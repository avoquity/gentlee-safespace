
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureFlags {
  guidedConversation: boolean;
  wisdomLibrary: boolean;
  isLoading: boolean;
}

export const useFeatureFlags = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>({
    guidedConversation: false,
    wisdomLibrary: false,
    isLoading: true
  });

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      if (!user) {
        setFlags({ guidedConversation: false, wisdomLibrary: false, isLoading: false });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('feature_guided_conversation, feature_wisdom_library')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setFlags({
          guidedConversation: data?.feature_guided_conversation || false,
          wisdomLibrary: data?.feature_wisdom_library || false,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching feature flags:', error);
        setFlags({ guidedConversation: false, wisdomLibrary: false, isLoading: false });
      }
    };

    fetchFeatureFlags();
  }, [user]);

  return flags;
};
