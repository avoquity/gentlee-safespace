
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
