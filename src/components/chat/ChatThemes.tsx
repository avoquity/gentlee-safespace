
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatEntry } from '@/types/chat';
import { getThemeStyles } from '@/utils/themeUtils';

interface ChatThemesProps {
  themes: string[];
  hasMessages: boolean;
  entries?: ChatEntry[];
}

export const ChatThemes = ({ themes, hasMessages, entries = [] }: ChatThemesProps) => {
  const navigate = useNavigate();

  if (!hasMessages) {
    return (
      <span className="px-4 py-1.5 text-sm rounded-full border border-deep-charcoal/20 text-deep-charcoal/40">
        No theme yet
      </span>
    );
  }

  const handleThemeClick = (theme: string) => {
    navigate('/entries', { state: { selectedTheme: theme } });
  };

  return (
    <>
      {themes.slice(0, 3).map((theme) => {
        const borderColor = getThemeStyles(theme, entries);
        return (
          <button
            key={theme}
            onClick={() => handleThemeClick(theme)}
            className="px-4 py-1.5 text-sm rounded-full border text-deep-charcoal transition-colors duration-200 hover:brightness-95"
            style={{ 
              borderColor,
              backgroundColor: borderColor
            }}
          >
            {theme}
          </button>
        );
      })}
    </>
  );
};
