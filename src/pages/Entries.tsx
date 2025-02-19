
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { getThemeStyles } from '@/utils/themeUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
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
        .select('id, created_at, theme, summary')
        .eq('user_id', user.id)
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

  const startNewChat = () => {
    navigate('/chat', {
      state: {
        initialMessage: "Hi there! How are you feeling today? I'm here to listen and chat about whatever's on your mind."
      }
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      <div className="fixed top-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="text-deep-charcoal font-montserrat font-bold text-2xl">
              Gentlee
            </Link>
            <Button
              onClick={startNewChat}
              className="px-6 py-2 rounded-full bg-deep-charcoal border-2 border-deep-charcoal text-white hover:bg-muted-sage hover:border-muted-sage"
            >
              New Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-deep-charcoal">
            Looking back, to move forward.
          </h1>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => navigate('/chat', { 
                state: { chatId: entry.id }
              })}
              className="w-full text-left p-6 border-2 border-deep-charcoal rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="space-y-3">
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
                {entry.summary && (
                  <p className="text-sm text-deep-charcoal/80 italic">
                    {entry.summary}
                  </p>
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
