
import React from 'react';

interface ChatThemesProps {
  themes: string[];
  hasMessages: boolean;
}

export const ChatThemes = ({ themes, hasMessages }: ChatThemesProps) => {
  if (!hasMessages) {
    return (
      <span className="px-4 py-1.5 text-sm rounded-full border border-deep-charcoal/20 text-deep-charcoal/40">
        No theme yet
      </span>
    );
  }

  return (
    <>
      {themes.map((theme) => (
        <span
          key={theme}
          className="px-4 py-1.5 text-sm rounded-full border border-deep-charcoal text-deep-charcoal hover:bg-muted-sage hover:text-white hover:border-muted-sage transition-colors"
        >
          {theme}
        </span>
      ))}
    </>
  );
};
