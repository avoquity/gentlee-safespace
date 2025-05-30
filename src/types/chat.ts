
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  user_role?: 'user' | 'assistant'; // Adding user_role property to match DatabaseMessage
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
  entryDate?: string;
}

export interface DatabaseMessage {
  id: number;
  content: string;
  user_role: string;
  created_at: string;
  chat_id: number;
  sender_id: string | null;
}

export interface Highlight {
  id: number;
  message_id: number;
  start_index: number;
  end_index: number;
  created_at: string;
}
