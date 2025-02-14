
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatEntry {
  id: string;
  messages: Message[];
  date: Date;
  themes: string[];
}

const Entries = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = React.useState<ChatEntry[]>([]);

  React.useEffect(() => {
    const storedEntries = localStorage.getItem('chatEntries');
    if (storedEntries) {
      const parsedEntries = JSON.parse(storedEntries);
      // Sort entries by date (newest first)
      parsedEntries.sort((a: ChatEntry, b: ChatEntry) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(parsedEntries);
    }
  }, []);

  return (
    <div className="min-h-screen bg-soft-ivory">
      <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6">
        <h1 className="text-5xl font-bold text-deep-charcoal mb-12">
          Your Journal Entries
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
              <h2 className="text-xl font-semibold text-deep-charcoal">
                {format(new Date(entry.date), 'd MMMM yyyy')}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {entry.themes.map((theme) => (
                  <span
                    key={theme}
                    className="px-4 py-1.5 text-sm rounded-full border border-deep-charcoal text-deep-charcoal group-hover:bg-muted-sage group-hover:text-white group-hover:border-muted-sage transition-colors"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Entries;
