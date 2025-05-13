
// Types for analytics tracking
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

// Profile type
export interface ProfileWithCheckIn {
  id: string;
  created_at?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  subscription_current_period_end?: string | null;
  subscription_end_date?: string | null;
  subscription_id?: string | null;
  subscription_plan?: string | null;
  subscription_start_date?: string | null;
  subscription_status?: string | null;
}
