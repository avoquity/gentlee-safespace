import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { format, isToday } from 'date-fns';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getThemeStyles } from '@/utils/themeUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ChatEntry } from '@/types/chat';
import { useInView } from 'react-intersection-observer';
import { ArrowLeft } from 'lucide-react';

const ENTRIES_PER_PAGE = 10;

const Entries = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(
    location.state?.selectedTheme || null
  );
  const { ref: loadMoreRef, inView } = useInView();
  const [isScrolled, setIsScrolled] = useState(false);

  // Ensure hooks are not conditionally rendered
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
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user, // Ensure the query is enabled only when the user is defined
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const startNewChat = async () => {
    const todayChat = (data?.pages[0]?.entries || []).find(entry => 
      isToday(new Date(entry.created_at))
    );

    if (todayChat) {
      navigate(`/chat/${todayChat.id}`);
      return;
    }

    navigate('/chat', {
      state: {
        initialMessage: "Hi there! How are you feeling today? I'm here to listen and chat about whatever's on your mind."
      }
    });
  };

  const handleThemeClick = (e: React.MouseEvent, theme: string) => {
    e.stopPropagation();
    setSelectedTheme(theme.trim());
  };

  // At this point, we know user is defined.
  const entries = data?.pages.flatMap(page => page.entries) || [];
  const allThemes = new Set<string>();
  entries.forEach(entry => {
    if (entry.theme) {
      entry.theme.split(',').forEach(theme => allThemes.add(theme.trim()));
    }
  });

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
      <div className={`fixed top-0 w-full transition-colors duration-200 z-50 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}>
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
          <h1 className="text-5xl font-bold text-deep-charcoal mb-4">
            Looking back, to move forward.
          </h1>
          {selectedTheme && (
            <button
              onClick={() => setSelectedTheme(null)}
              className="flex items-center gap-2 text-deep-charcoal hover:text-muted-sage transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>My thoughts</span>
            </button>
          )}
        </div>

        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date} className="space-y-4">
              {dateEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="w-full p-6 border-2 border-deep-charcoal rounded-xl transition-colors group cursor-pointer hover:bg-[#E9E9E3]/50"
                  onClick={() => navigate(`/chat/${entry.id}`, { state: { entryDate: date } })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate(`/chat/${entry.id}`, { state: { entryDate: date } });
                    }
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl font-semibold text-deep-charcoal">
                      {date}
                    </h2>
                    {entry.theme && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {entry.theme.split(',').map((theme) => {
                          const borderColor = getThemeStyles(theme.trim(), entries);
                          return (
                            <button
                              key={theme}
                              onClick={(e) => handleThemeClick(e, theme)}
                              className="px-4 py-1.5 text-sm rounded-full border text-deep-charcoal transition-colors duration-200 hover:brightness-95"
                              style={{ borderColor, backgroundColor: borderColor }}
                            >
                              {theme.trim()}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {entry.summary && (
                    <p className="text-sm text-deep-charcoal/80 italic mt-3">
                      {entry.summary}
                    </p>
                  )}
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

        {selectedTheme && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <Button onClick={() => setSelectedTheme(null)} variant="outline" className="shadow-lg">
              Clear filter: {selectedTheme}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Entries;