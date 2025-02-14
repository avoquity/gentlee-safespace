
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getThemeStyles } from '@/utils/themeUtils';
import { ChatEntry } from '@/types/chat';

const Entries = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = React.useState<ChatEntry[]>([]);

  React.useEffect(() => {
    const storedEntries = localStorage.getItem('chatEntries');
    if (storedEntries) {
      const parsedEntries = JSON.parse(storedEntries);
      parsedEntries.sort((a: ChatEntry, b: ChatEntry) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(parsedEntries);
    }
  }, []);

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
                state: { messages: entry.messages }
              })}
              className="w-full text-left p-6 border-2 border-deep-charcoal rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-deep-charcoal">
                  {format(new Date(entry.date), 'd MMMM yyyy')}
                </h2>
                <div className="flex flex-wrap gap-2 justify-end">
                  {entry.themes.slice(0, 3).map((theme) => {
                    const borderColor = getThemeStyles(theme, entries);
                    return (
                      <span
                        key={theme}
                        className="px-4 py-1.5 text-sm rounded-full border text-deep-charcoal group-hover:bg-soft-yellow transition-colors duration-200"
                        style={{ borderColor }}
                      >
                        {theme}
                      </span>
                    );
                  })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Entries;
