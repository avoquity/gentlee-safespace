
import { Message, Highlight } from '@/types/chat';

export type UseChatReturn = {
  messages: Message[];
  input: string;
  setInput: (input: string) => void;
  isTyping: boolean;
  isMuted: boolean;
  highlights: Highlight[];
  displayDate: string;
  messageCount: number; // Add message count
  handleSubmit: (e: React.FormEvent) => void;
  handleCloseConversation: () => void;
  handleHighlightChange: (highlight: Highlight) => void;
  handleHighlightRemove: (highlightId: number) => void;
  handleMuteToggle: () => void;
  processInitialMessage: () => Promise<void>;
  loadTodaysChat: () => Promise<void>;
  updateMessage: (id: string, updater: ((prevText: string) => string) | string, newText?: string) => void;
  addMessage: (message: Message) => void;
};
