
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format, startOfDay, isToday } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getThemeStyles } from '@/utils/themeUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ChatEntry } from '@/types/chat';
import { useInView } from 'react-intersection-observer';

const ENTRIES_PER_PAGE = 10;

const Entries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const { ref: loadMoreRef, inView } = useInView();

  const fetchEntries = async ({ pageParam = 0 }) => {
    if (!user) return { entries: [], nextPage: null };

    let query = supabase
      .from('chat')
      .select('id, created_at, theme, summary')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(pageParam * ENTRIES_PER_PAGE, (pageParam + 1) * ENTRIES_PER_PAGE - 1);

    if (selectedTheme) {
      query = query.textSearch('theme', selectedTheme);
    }

    const { data: entries, error } = await query;

    if (error) {
      toast({
        title: "Error loading chats",
        description: error.message,
        variant: "destructive"
      });
      return { entries: [], nextPage: null };
    }

    const hasMore = entries.length === ENTRIES_PER_PAGE;
    return {
      entries,
      nextPage: hasMore ? pageParam + 1 : null,
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['chats', user?.id, selectedTheme],
    queryFn: fetchEntries,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user
  });

  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const startNewChat = async () => {
    const todayChat = (data?.pages[0]?.entries || []).find(entry => 
      isToday(new Date(entry.created_at))
    );

    if (todayChat) {
      navigate('/chat', {
        state: { chatId: todayChat.id }
      });
      return;
    }

    navigate('/chat', {
      state: {
        initialMessage: "Hi there! How are you feeling today? I'm here to listen and chat about whatever's on your mind."
      }
    });
  };

  if (!user) {
    return null;
  }

  const entries = data?.pages.flatMap(page => page.entries) || [];
  const allThemes = new Set<string>();
  entries.forEach(entry => {
    if (entry.theme) {
      entry.theme.split(',').forEach(theme => allThemes.add(theme.trim()));
    }
  });

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    const date = format(new Date(entry.created_at), 'd MMMM yyyy');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, ChatEntry[]>);

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

        <div className="flex flex-wrap gap-2 mb-8" role="tablist">
          <button
            role="tab"
            aria-selected={!selectedTheme}
            onClick={() => setSelectedTheme(null)}
            className={`px-4 py-1.5 rounded-full border transition-colors duration-200 ${
              !selectedTheme 
                ? 'bg-muted-sage text-white border-muted-sage' 
                : 'border-deep-charcoal/20 text-deep-charcoal/60 hover:border-deep-charcoal/40'
            }`}
          >
            All entries
          </button>
          {Array.from(allThemes).map((theme) => {
            const borderColor = getThemeStyles(theme, entries);
            return (
              <button
                key={theme}
                role="tab"
                aria-selected={selectedTheme === theme}
                onClick={() => setSelectedTheme(theme)}
                className={`px-4 py-1.5 rounded-full border text-deep-charcoal transition-colors duration-200 hover:bg-soft-yellow/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-muted-sage`}
                style={{ 
                  borderColor,
                  backgroundColor: selectedTheme === theme ? borderColor : 'transparent',
                }}
              >
                {theme}
              </button>
            );
          })}
        </div>

        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date} className="space-y-4">
              {dateEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="w-full p-6 border-2 border-deep-charcoal rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                  onClick={() => navigate('/chat', { state: { chatId: entry.id } })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate('/chat', { state: { chatId: entry.id } });
                    }
                  }}
                >
                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold text-muted-sage mb-4">
                      {date}
                    </h2>
                    {entry.theme && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {entry.theme.split(',').map((theme) => {
                          const borderColor = getThemeStyles(theme.trim(), entries);
                          return (
                            <span
                              key={theme}
                              className="px-4 py-1.5 text-sm rounded-full border text-deep-charcoal group-hover:bg-soft-yellow/10 transition-colors duration-200"
                              style={{ borderColor }}
                            >
                              {theme.trim()}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {entry.summary && (
                      <p className="text-sm text-deep-charcoal/80 italic">
                        {entry.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {hasNextPage && (
          <div ref={loadMoreRef} className="py-8 text-center">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
            >
              {isFetchingNextPage ? 'Loading more...' : 'Load more entries'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Entries;
