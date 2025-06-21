
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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      analysis_projects: {
        Row: {
          created_at: string
          critical_issues: number | null
          description: string | null
          file_count: number | null
          id: string
          name: string
          status: string | null
          total_issues: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          critical_issues?: number | null
          description?: string | null
          file_count?: number | null
          id?: string
          name: string
          status?: string | null
          total_issues?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          critical_issues?: number | null
          description?: string | null
          file_count?: number | null
          id?: string
          name?: string
          status?: string | null
          total_issues?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analysis_results: {
        Row: {
          created_at: string
          file_content: string
          file_name: string
          id: string
          issues: Json
          metrics: Json
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_content: string
          file_name: string
          id?: string
          issues?: Json
          metrics?: Json
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_content?: string
          file_name?: string
          id?: string
          issues?: Json
          metrics?: Json
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "analysis_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          starts_at: string | null
          target_audience: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          target_audience?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          starts_at?: string | null
          target_audience?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          method: string
          request_data: Json | null
          response_data: Json | null
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          method: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          method?: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "user_api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      database_exports: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          download_url: string | null
          expires_at: string | null
          export_type: string
          file_size: number | null
          id: string
          record_count: number | null
          status: string
          table_name: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          download_url?: string | null
          expires_at?: string | null
          export_type: string
          file_size?: number | null
          id?: string
          record_count?: number | null
          status?: string
          table_name: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          download_url?: string | null
          expires_at?: string | null
          export_type?: string
          file_size?: number | null
          id?: string
          record_count?: number | null
          status?: string
          table_name?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          rollout_percentage: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          rollout_percentage?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          rollout_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_gateways: {
        Row: {
          configuration: Json
          created_at: string
          credentials: Json
          display_name: string
          id: string
          is_enabled: boolean
          name: string
          updated_at: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          credentials?: Json
          display_name: string
          id?: string
          is_enabled?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          credentials?: Json
          display_name?: string
          id?: string
          is_enabled?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          component: string | null
          created_at: string
          id: string
          metric_name: string
          metric_type: string
          metric_value: number
        }
        Insert: {
          component?: string | null
          created_at?: string
          id?: string
          metric_name: string
          metric_type: string
          metric_value: number
        }
        Update: {
          component?: string | null
          created_at?: string
          id?: string
          metric_name?: string
          metric_type?: string
          metric_value?: number
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          name: string
          price_monthly: number | null
          price_yearly: number | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price_monthly?: number | null
          price_yearly?: number | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          last_sign_in_at: string | null
          status: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          last_sign_in_at?: string | null
          status?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          last_sign_in_at?: string | null
          status?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string
          file_path: string | null
          file_size: number | null
          id: string
          started_at: string | null
          status: string
          tables_included: string[] | null
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          component: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          level: string
          message: string
          metadata: Json | null
          stack_trace: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          level: string
          message: string
          metadata?: Json | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          level?: string
          message?: string
          metadata?: Json | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit_per_minute: number | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          rate_limit_per_minute?: number | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit_per_minute?: number | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      educational_modules: {
        Row: {
          id: string
          title: string
          description: string
          concept_level: string
          category: string
          issue_type: string
          examples: Json
          quiz: Json
          related_resources: Json
          times_shown: number
          completion_rate: number
          average_score: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          concept_level: string
          category: string
          issue_type: string
          examples: Json
          quiz: Json
          related_resources?: Json
          times_shown?: number
          completion_rate?: number
          average_score?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          concept_level?: string
          category?: string
          issue_type?: string
          examples?: Json
          quiz?: Json
          related_resources?: Json
          times_shown?: number
          completion_rate?: number
          average_score?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          status: string
          quiz_attempts: Json
          time_spent: number
          concepts_mastered: string[]
          last_accessed: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          status?: string
          quiz_attempts?: Json
          time_spent?: number
          concepts_mastered?: string[]
          last_accessed?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string
          status?: string
          quiz_attempts?: Json
          time_spent?: number
          concepts_mastered?: string[]
          last_accessed?: string
          completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_analytics: {
        Row: {
          id: string
          user_id: string
          module_id: string | null
          event: string
          metadata: Json
          session_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          module_id?: string | null
          event: string
          metadata?: Json
          session_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          module_id?: string | null
          event?: string
          metadata?: Json
          session_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_analytics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          }
        ]
      }
      code_issue_education_mapping: {
        Row: {
          id: string
          issue_type: string
          module_id: string | null
          has_educational_content: boolean
          concept_name: string | null
          difficulty: string | null
          learning_priority: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_type: string
          module_id?: string | null
          has_educational_content?: boolean
          concept_name?: string | null
          difficulty?: string | null
          learning_priority?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_type?: string
          module_id?: string | null
          has_educational_content?: boolean
          concept_name?: string | null
          difficulty?: string | null
          learning_priority?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_issue_education_mapping_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_api_key: {
        Args: { key_name: string }
        Returns: {
          api_key: string
        }[]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      get_educational_content_for_issue: {
        Args: { issue_type_param: string }
        Returns: {
          module_id: string | null
          title: string | null
          description: string | null
          concept_level: string | null
          category: string | null
          has_content: boolean | null
          learning_priority: number | null
        }[]
      }
      track_learning_event: {
        Args: {
          p_user_id: string
          p_module_id: string
          p_event: string
          p_metadata?: Json
          p_session_id?: string | null
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {;
    Enums: {;
      app_role: ["admin", "user"],;
    },;
  },;
} as const;
