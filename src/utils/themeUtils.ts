
import { Message, ChatEntry } from '@/types/chat';

const getThemeColor = (frequency: number): string => {
  if (frequency >= 21) return '#A86864';
  if (frequency >= 11) return '#C48A86';
  if (frequency >= 6) return '#DAA7A3';
  if (frequency >= 3) return '#EEC7C3';
  return '#F7E4E1';
};

export const getThemeFrequency = (theme: string, entries: ChatEntry[]): number => {
  return entries.filter(entry => entry.theme?.includes(theme)).length;
};

export const identifyThemes = (messages: Message[]): string[] => {
  const commonThemes = [
    'Anxiety', 'Growth', 'Relationships', 'Career',
    'Self-discovery', 'Healing', 'Goals', 'Changes'
  ];
  
  const messageText = messages.map(m => m.text.toLowerCase()).join(' ');
  return commonThemes.filter(theme => 
    messageText.includes(theme.toLowerCase())
  ).slice(0, 3); // Limit to 3 themes
};

export const getThemeStyles = (theme: string, entries: ChatEntry[]): string => {
  const frequency = getThemeFrequency(theme, entries);
  const color = getThemeColor(frequency);
  return color;
};
