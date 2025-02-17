
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatEntry {
  id: string;
  messages: Message[];
  date: Date;
  themes: string[];
}

export interface LocationState {
  initialMessage?: string;
}

export interface DatabaseMessage {
  id: number;
  content: string;
  user_role: string;
  created_at: string;
  chat_id: number;
  sender_id: string | null;
}
