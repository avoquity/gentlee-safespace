
import { Message, ChatEntry } from '@/types/chat';

const commonThemes = [
  'Anxiety', 'Growth', 'Relationships', 'Career',
  'Self-discovery', 'Healing', 'Goals', 'Changes',
  'Stress', 'Family', 'Health', 'Learning',
  'Travel', 'Work', 'Creativity', 'Emotions'
];

const getThemeColor = (frequency: number): string => {
  if (frequency >= 21) return '#C99829'; // Level 5
  if (frequency >= 11) return '#E5B94E'; // Level 4
  if (frequency >= 6) return '#F5D76E';  // Level 3
  if (frequency >= 3) return '#FCEEBB';  // Level 2
  return '#FFF9E6';                      // Level 1
};

export const getThemeFrequency = (theme: string, entries: ChatEntry[]): number => {
  return entries.filter(entry => entry.theme?.includes(theme)).length;
};

export const identifyThemes = (messages: Message[]): string[] => {
  const messageText = messages.map(m => m.text.toLowerCase()).join(' ');
  
  // Use a scoring system for theme relevance
  const themeScores = commonThemes.map(theme => {
    const themeWords = theme.toLowerCase().split(' ');
    const score = themeWords.reduce((acc, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = messageText.match(regex);
      return acc + (matches ? matches.length : 0);
    }, 0);
    return { theme, score };
  });

  // Sort by score and take top 3
  return themeScores
    .filter(t => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(t => t.theme);
};

export const getThemeStyles = (theme: string, entries: ChatEntry[]): string => {
  const frequency = getThemeFrequency(theme, entries);
  return getThemeColor(frequency);
};
