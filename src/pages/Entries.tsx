
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getThemeStyles } from '@/utils/themeUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ChatEntry } from '@/types/chat';

const Entries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: entries = [] } = useQuery({
    queryKey: ['chats', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: chats, error } = await supabase
        .from('chat')
        .select(`
          id,
          created_at,
          theme,
          messages (
            content,
            user_role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading chats",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return chats as ChatEntry[];
    },
    enabled: !!user
  });

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6">
        {/* Logo */}
        <Link 
          to="/"
          className="absolute left-6 top-8 text-2xl font-bold text-deep-charcoal hover:text-dusty-rose transition-colors"
        >
          Lumi
        </Link>

        <h1 className="text-5xl font-bold text-deep-charcoal mb-12">
          Looking back, to move forward.
        </h1>

        <div className="space-y-4">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => navigate('/chat', { 
                state: { chatId: entry.id }
              })}
              className="w-full text-left p-6 border-2 border-deep-charcoal rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-deep-charcoal">
                  {format(new Date(entry.created_at), 'd MMMM yyyy')}
                </h2>
                {entry.theme && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {entry.theme.split(',').map((theme) => {
                      const borderColor = getThemeStyles(theme.trim(), entries);
                      return (
                        <span
                          key={theme}
                          className="px-4 py-1.5 text-sm rounded-full border text-deep-charcoal group-hover:bg-soft-yellow transition-colors duration-200"
                          style={{ borderColor }}
                        >
                          {theme.trim()}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Entries;
