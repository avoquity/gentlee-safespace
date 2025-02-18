
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatEntry {
  id: number;
  created_at: string;
  theme: string | null;
  summary: string | null;
}

export interface LocationState {
  initialMessage?: string;
  chatId?: number;
}

export interface DatabaseMessage {
  id: number;
  content: string;
  user_role: string;
  created_at: string;
  chat_id: number;
  sender_id: string | null;
}
