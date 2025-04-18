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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
