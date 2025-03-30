
export interface Message {
  id: number | string;
  chat_id: number;
  user_id: string;
  content: string;
  user_role: string;
  created_at: string;
}

export interface Highlight {
  id: number;
  message_id: number;
  text?: string;
  start_index?: number;
  end_index?: number;
  created_at?: string;
  user_id?: string;
}
