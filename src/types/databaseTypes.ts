
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

// Profile type with new feature flags
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
  checkin_opted_in?: boolean | null;
  last_mood_value?: number | null;
  last_checkin_at?: string | null;
  // New feature flags
  onboarding_completed?: boolean | null;
  feature_guided_conversation?: boolean | null;
  feature_wisdom_library?: boolean | null;
  first_chat_completed?: boolean | null;
}

// User insights type
export interface UserInsight {
  id?: number;
  user_id: string;
  last_shown_at: string;
  created_at?: string;
}

// New types for personalized insights
export interface PersonalizedInsight {
  id: string;
  user_id: string;
  insight_text: string;
  generated_from_themes?: string[];
  conversation_context?: string;
  generated_at: string;
  created_at: string;
}

export interface SavedInsight {
  id: string;
  user_id: string;
  insight_text: string;
  insight_type: 'generic' | 'personalized';
  personalized_insight_id?: string;
  user_notes?: string;
  saved_at: string;
  created_at: string;
}
