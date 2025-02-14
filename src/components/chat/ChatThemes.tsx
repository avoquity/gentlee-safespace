
import React from 'react';
import { ChatEntry } from '@/types/chat';
import { getThemeStyles } from '@/utils/themeUtils';

interface ChatThemesProps {
  themes: string[];
  hasMessages: boolean;
  entries?: ChatEntry[];
}

export const ChatThemes = ({ themes, hasMessages, entries = [] }: ChatThemesProps) => {
  if (!hasMessages) {
    return (
      <span className="px-4 py-1.5 text-sm rounded-full border border-deep-charcoal/20 text-deep-charcoal/40">
        No theme yet
      </span>
    );
  }

  return (
    <>
      {themes.slice(0, 3).map((theme) => {
        const borderColor = getThemeStyles(theme, entries);
        return (
          <span
            key={theme}
            className="px-4 py-1.5 text-sm rounded-full border text-deep-charcoal hover:bg-soft-yellow transition-colors duration-200"
            style={{ borderColor }}
          >
            {theme}
          </span>
        );
      })}
    </>
  );
};
