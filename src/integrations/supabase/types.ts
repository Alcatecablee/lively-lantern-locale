export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_provider_usage: {
        Row: {
          cost: number | null
          created_at: string | null
          error_code: string | null
          id: string
          model: string
          provider: string
          response_time_ms: number | null
          session_id: string | null
          success: boolean | null
          tokens_input: number
          tokens_output: number
          user_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          error_code?: string | null
          id?: string
          model: string
          provider: string
          response_time_ms?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_input: number
          tokens_output: number
          user_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          error_code?: string | null
          id?: string
          model?: string
          provider?: string
          response_time_ms?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_input?: number
          tokens_output?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_usage_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_provider_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      Analysis: {
        Row: {
          codeFileId: string | null
          completedAt: string | null
          createdAt: string
          criticalIssues: number
          highIssues: number
          id: string
          lowIssues: number
          mediumIssues: number
          name: string
          projectId: string | null
          status: string
          totalIssues: number
          updatedAt: string
          userId: string
        }
        Insert: {
          codeFileId?: string | null
          completedAt?: string | null
          createdAt?: string
          criticalIssues?: number
          highIssues?: number
          id: string
          lowIssues?: number
          mediumIssues?: number
          name: string
          projectId?: string | null
          status?: string
          totalIssues?: number
          updatedAt: string
          userId: string
        }
        Update: {
          codeFileId?: string | null
          completedAt?: string | null
          createdAt?: string
          criticalIssues?: number
          highIssues?: number
          id?: string
          lowIssues?: number
          mediumIssues?: number
          name?: string
          projectId?: string | null
          status?: string
          totalIssues?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Analysis_codeFileId_fkey"
            columns: ["codeFileId"]
            isOneToOne: false
            referencedRelation: "CodeFile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Analysis_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Analysis_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      AnalysisRule: {
        Row: {
          category: string
          createdAt: string
          description: string
          id: string
          isActive: boolean
          language: string
          name: string
          pattern: string
          severity: string
          updatedAt: string
        }
        Insert: {
          category: string
          createdAt?: string
          description: string
          id: string
          isActive?: boolean
          language: string
          name: string
          pattern: string
          severity: string
          updatedAt: string
        }
        Update: {
          category?: string
          createdAt?: string
          description?: string
          id?: string
          isActive?: boolean
          language?: string
          name?: string
          pattern?: string
          severity?: string
          updatedAt?: string
        }
        Relationships: []
      }
      chat_code_interactions: {
        Row: {
          code_after: string | null
          code_before: string | null
          created_at: string | null
          id: string
          interaction_type: string
          layers_triggered: string | null
          message_id: string
          transformation_results: string | null
          user_feedback: string | null
        }
        Insert: {
          code_after?: string | null
          code_before?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          layers_triggered?: string | null
          message_id: string
          transformation_results?: string | null
          user_feedback?: string | null
        }
        Update: {
          code_after?: string | null
          code_before?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          layers_triggered?: string | null
          message_id?: string
          transformation_results?: string | null
          user_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_code_interactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          code_context: string | null
          content: string
          created_at: string | null
          id: string
          is_edited: boolean | null
          message_type: string
          metadata: string | null
          parent_message_id: string | null
          processing_time_ms: number | null
          role: string
          session_id: string
          tokens: number | null
          updated_at: string | null
        }
        Insert: {
          code_context?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string
          metadata?: string | null
          parent_message_id?: string | null
          processing_time_ms?: number | null
          role: string
          session_id: string
          tokens?: number | null
          updated_at?: string | null
        }
        Update: {
          code_context?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string
          metadata?: string | null
          parent_message_id?: string | null
          processing_time_ms?: number | null
          role?: string
          session_id?: string
          tokens?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          ai_provider: string
          code_context: string | null
          created_at: string | null
          id: string
          is_collaborative: boolean | null
          model_settings: string | null
          neurolint_context: string | null
          status: string
          team_id: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_provider?: string
          code_context?: string | null
          created_at?: string | null
          id?: string
          is_collaborative?: boolean | null
          model_settings?: string | null
          neurolint_context?: string | null
          status?: string
          team_id?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_provider?: string
          code_context?: string | null
          created_at?: string | null
          id?: string
          is_collaborative?: boolean | null
          model_settings?: string | null
          neurolint_context?: string | null
          status?: string
          team_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      CodeFile: {
        Row: {
          content: string
          createdAt: string
          id: string
          language: string
          name: string
          projectId: string
          updatedAt: string
        }
        Insert: {
          content: string
          createdAt?: string
          id: string
          language: string
          name: string
          projectId: string
          updatedAt: string
        }
        Update: {
          content?: string
          createdAt?: string
          id?: string
          language?: string
          name?: string
          projectId?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "CodeFile_projectId_fkey"
            columns: ["projectId"]
            isOneToOne: false
            referencedRelation: "Project"
            referencedColumns: ["id"]
          },
        ]
      }
      Finding: {
        Row: {
          analysisId: string
          codeSnippet: string | null
          columnNumber: number | null
          createdAt: string
          id: string
          lineNumber: number | null
          message: string
          ruleId: string
          severity: string
          suggestion: string | null
        }
        Insert: {
          analysisId: string
          codeSnippet?: string | null
          columnNumber?: number | null
          createdAt?: string
          id: string
          lineNumber?: number | null
          message: string
          ruleId: string
          severity: string
          suggestion?: string | null
        }
        Update: {
          analysisId?: string
          codeSnippet?: string | null
          columnNumber?: number | null
          createdAt?: string
          id?: string
          lineNumber?: number | null
          message?: string
          ruleId?: string
          severity?: string
          suggestion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Finding_analysisId_fkey"
            columns: ["analysisId"]
            isOneToOne: false
            referencedRelation: "Analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Finding_ruleId_fkey"
            columns: ["ruleId"]
            isOneToOne: false
            referencedRelation: "AnalysisRule"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          payment_type: string | null
          paypal_payment_id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_type?: string | null
          paypal_payment_id: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          payment_type?: string | null
          paypal_payment_id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          monthly_limit: number | null
          monthly_transformations_used: number | null
          plan_type: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          monthly_limit?: number | null
          monthly_transformations_used?: number | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          monthly_limit?: number | null
          monthly_transformations_used?: number | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      Project: {
        Row: {
          createdAt: string
          description: string | null
          id: string
          name: string
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          id: string
          name: string
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          id?: string
          name?: string
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Project_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          end_date: string
          id: string
          paypal_subscription_id: string | null
          plan: string
          start_date: string
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          end_date: string
          id?: string
          paypal_subscription_id?: string | null
          plan: string
          start_date: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          end_date?: string
          id?: string
          paypal_subscription_id?: string | null
          plan?: string
          start_date?: string
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activities: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          project: string | null
          team_id: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          project?: string | null
          team_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          project?: string | null
          team_id?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_activities_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_projects: {
        Row: {
          created_at: string | null
          fixed_issues: number | null
          health_score: number | null
          id: string
          last_scan: string | null
          name: string
          repository: string | null
          team_id: string | null
          total_issues: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fixed_issues?: number | null
          health_score?: number | null
          id?: string
          last_scan?: string | null
          name: string
          repository?: string | null
          team_id?: string | null
          total_issues?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fixed_issues?: number | null
          health_score?: number | null
          id?: string
          last_scan?: string | null
          name?: string
          repository?: string | null
          team_id?: string | null
          total_issues?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          monthly_limit: number | null
          name: string
          owner_id: string | null
          plan_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_limit?: number | null
          name: string
          owner_id?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          monthly_limit?: number | null
          name?: string
          owner_id?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      Transformation: {
        Row: {
          analysisId: string
          appliedAt: string | null
          createdAt: string
          description: string
          id: string
          name: string
          originalCode: string
          status: string
          transformedCode: string
        }
        Insert: {
          analysisId: string
          appliedAt?: string | null
          createdAt?: string
          description: string
          id: string
          name: string
          originalCode: string
          status?: string
          transformedCode: string
        }
        Update: {
          analysisId?: string
          appliedAt?: string | null
          createdAt?: string
          description?: string
          id?: string
          name?: string
          originalCode?: string
          status?: string
          transformedCode?: string
        }
        Relationships: [
          {
            foreignKeyName: "Transformation_analysisId_fkey"
            columns: ["analysisId"]
            isOneToOne: false
            referencedRelation: "Analysis"
            referencedColumns: ["id"]
          },
        ]
      }
      transformations: {
        Row: {
          changes_count: number | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number | null
          file_name: string | null
          guest_session_id: string | null
          id: string
          is_guest: boolean | null
          layers_used: number[] | null
          original_code_length: number | null
          success: boolean | null
          transformed_code_length: number | null
          user_id: string | null
        }
        Insert: {
          changes_count?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          file_name?: string | null
          guest_session_id?: string | null
          id?: string
          is_guest?: boolean | null
          layers_used?: number[] | null
          original_code_length?: number | null
          success?: boolean | null
          transformed_code_length?: number | null
          user_id?: string | null
        }
        Update: {
          changes_count?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number | null
          file_name?: string | null
          guest_session_id?: string | null
          id?: string
          is_guest?: boolean | null
          layers_used?: number[] | null
          original_code_length?: number | null
          success?: boolean | null
          transformed_code_length?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transformations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_analytics: {
        Row: {
          date: string | null
          id: string
          total_execution_time_ms: number | null
          transformations_count: number | null
          user_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          total_execution_time_ms?: number | null
          transformations_count?: number | null
          user_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          total_execution_time_ms?: number | null
          transformations_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      User: {
        Row: {
          createdAt: string
          email: string
          id: string
        }
        Insert: {
          createdAt?: string
          email: string
          id: string
        }
        Update: {
          createdAt?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          clerk_id: string
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          monthly_limit: number | null
          monthly_transformations_used: number | null
          password_hash: string | null
          plan_type: string | null
          updated_at: string | null
        }
        Insert: {
          clerk_id: string
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          monthly_limit?: number | null
          monthly_transformations_used?: number | null
          password_hash?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Update: {
          clerk_id?: string
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          monthly_limit?: number | null
          monthly_transformations_used?: number | null
          password_hash?: string | null
          plan_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_complete_schema: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      increment_monthly_usage: {
        Args: { clerk_user_id: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
