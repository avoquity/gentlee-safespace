export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat: {
        Row: {
          created_at: string
          id: number
          last_updated: string
          summary: string | null
          theme: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          last_updated: string
          summary?: string | null
          theme?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          last_updated?: string
          summary?: string | null
          theme?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      highlights: {
        Row: {
          created_at: string
          end_index: number
          id: number
          message_id: number
          start_index: number
          user_id: string
        }
        Insert: {
          created_at?: string
          end_index: number
          id?: number
          message_id: number
          start_index: number
          user_id: string
        }
        Update: {
          created_at?: string
          end_index?: number
          id?: number
          message_id?: number
          start_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlights_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      idea: {
        Row: {
          company_name: string
          created_at: string
          email: string
          id: number
          idea: string
          industry: string | null
          product_features: string
          target_audience: string
          unique_value: string | null
          user_acquisition: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          id?: number
          idea: string
          industry?: string | null
          product_features: string
          target_audience: string
          unique_value?: string | null
          user_acquisition?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: number
          idea?: string
          industry?: string | null
          product_features?: string
          target_audience?: string
          unique_value?: string | null
          user_acquisition?: string | null
        }
        Relationships: []
      }
      letters: {
        Row: {
          created_at: string
          id: string
          message_text: string
          send_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          send_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          send_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          chat_id: number
          content: string
          created_at: string
          id: number
          sender_id: string | null
          user_role: string
        }
        Insert: {
          chat_id: number
          content: string
          created_at?: string
          id?: number
          sender_id?: string | null
          user_role: string
        }
        Update: {
          chat_id?: number
          content?: string
          created_at?: string
          id?: number
          sender_id?: string | null
          user_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string
          email: string
          id: number
          payment_reference: string
          report_id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          payment_reference: string
          report_id: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          payment_reference?: string
          report_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "idea"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          subscription_current_period_end: string | null
          subscription_end_date: string | null
          subscription_id: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          subscription_status: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          subscription_current_period_end?: string | null
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          subscription_current_period_end?: string | null
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string
          created_at: string
          id: number
          idea_id: number
          section: string
          subsection: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          idea_id: number
          section: string
          subsection?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          idea_id?: number
          section?: string
          subsection?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "idea"
            referencedColumns: ["id"]
          },
        ]
      }
      user_insights: {
        Row: {
          created_at: string
          id: number
          last_shown_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          last_shown_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          last_shown_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_letter: {
        Args: { p_message_text: string; p_send_date?: string }
        Returns: string
      }
      get_user_insight: {
        Args: { user_uuid: string }
        Returns: {
          id: number
          user_id: string
          last_shown_at: string
          created_at: string
        }[]
      }
      upsert_user_insight: {
        Args: { user_uuid: string; shown_at: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
