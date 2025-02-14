
import { Message } from '@/types/chat';

export const identifyThemes = (messages: Message[]): string[] => {
  const commonThemes = [
    'Anxiety', 'Growth', 'Relationships', 'Career',
    'Self-discovery', 'Healing', 'Goals', 'Changes'
  ];
  
  const messageText = messages.map(m => m.text.toLowerCase()).join(' ');
  return commonThemes.filter(theme => 
    messageText.includes(theme.toLowerCase())
  );
};
