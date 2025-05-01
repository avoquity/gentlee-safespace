
// Types for check-in related database columns
export interface CheckInFields {
  checkin_enabled?: boolean;
  checkin_time?: string;
  last_notif_sent_at?: string | null;
  notif_this_week_count?: number;
  banner_seen?: boolean;
}

export interface PushSubscription {
  id?: number;
  user_id: string;
  subscription: string;
  created_at?: string;
  updated_at?: string;
}

export interface AnalyticsEvent {
  id?: number;
  user_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  created_at?: string;
}
