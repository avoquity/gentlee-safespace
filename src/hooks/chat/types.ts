
import { Message, Highlight } from '@/types/chat';

export interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  isMuted: boolean;
  highlights: Highlight[];
  displayDate?: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseConversation: () => void;
  handleHighlightChange: (highlight: Highlight) => void;
  handleHighlightRemove: (highlightId: number) => void;
  handleMuteToggle: () => void;
  processInitialMessage: () => Promise<void>;
  loadTodaysChat: () => Promise<void>;
}
