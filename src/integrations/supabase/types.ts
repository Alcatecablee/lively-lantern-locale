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
      ai_pattern_licenses: {
        Row: {
          actual_monthly_api_calls: number | null
          ai_company_name: string
          auto_renewal: boolean | null
          company_type: string
          contact_email: string
          contact_person: string | null
          contract_document_url: string | null
          created_at: string | null
          id: string
          license_end_date: string | null
          license_start_date: string | null
          license_status: string | null
          license_type: string
          monthly_api_calls_limit: number | null
          monthly_fee: number | null
          pattern_categories: Json
          per_pattern_fee: number | null
          pricing_model: string
          revenue_share_percentage: number | null
          signed_at: string | null
          total_patterns_licensed: number | null
          updated_at: string | null
          usage_volume_tier: string
        }
        Insert: {
          actual_monthly_api_calls?: number | null
          ai_company_name: string
          auto_renewal?: boolean | null
          company_type: string
          contact_email: string
          contact_person?: string | null
          contract_document_url?: string | null
          created_at?: string | null
          id?: string
          license_end_date?: string | null
          license_start_date?: string | null
          license_status?: string | null
          license_type: string
          monthly_api_calls_limit?: number | null
          monthly_fee?: number | null
          pattern_categories?: Json
          per_pattern_fee?: number | null
          pricing_model: string
          revenue_share_percentage?: number | null
          signed_at?: string | null
          total_patterns_licensed?: number | null
          updated_at?: string | null
          usage_volume_tier: string
        }
        Update: {
          actual_monthly_api_calls?: number | null
          ai_company_name?: string
          auto_renewal?: boolean | null
          company_type?: string
          contact_email?: string
          contact_person?: string | null
          contract_document_url?: string | null
          created_at?: string | null
          id?: string
          license_end_date?: string | null
          license_start_date?: string | null
          license_status?: string | null
          license_type?: string
          monthly_api_calls_limit?: number | null
          monthly_fee?: number | null
          pattern_categories?: Json
          per_pattern_fee?: number | null
          pricing_model?: string
          revenue_share_percentage?: number | null
          signed_at?: string | null
          total_patterns_licensed?: number | null
          updated_at?: string | null
          usage_volume_tier?: string
        }
        Relationships: []
      }
      analysis_projects: {
        Row: {
          analysis_results: Json | null
          created_at: string
          critical_issues: number | null
          description: string | null
          file_count: number | null
          id: string
          name: string
          shared_with_team: boolean | null
          status: string | null
          team_id: string | null
          total_issues: number | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          analysis_results?: Json | null
          created_at?: string
          critical_issues?: number | null
          description?: string | null
          file_count?: number | null
          id?: string
          name: string
          shared_with_team?: boolean | null
          status?: string | null
          team_id?: string | null
          total_issues?: number | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          analysis_results?: Json | null
          created_at?: string
          critical_issues?: number | null
          description?: string | null
          file_count?: number | null
          id?: string
          name?: string
          shared_with_team?: boolean | null
          status?: string | null
          team_id?: string | null
          total_issues?: number | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "analysis_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "analysis_projects_with_profiles"
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
      certification_exam_questions: {
        Row: {
          answer_choices: Json | null
          certification_level: string
          code_snippet: string | null
          correct_answer: string | null
          correct_answer_rate: number | null
          created_at: string | null
          created_by: string | null
          difficulty_level: number | null
          id: string
          is_active: boolean | null
          question_text: string
          question_type: string
          rubric: Json | null
          topic_category: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          answer_choices?: Json | null
          certification_level: string
          code_snippet?: string | null
          correct_answer?: string | null
          correct_answer_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          question_text: string
          question_type: string
          rubric?: Json | null
          topic_category: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          answer_choices?: Json | null
          certification_level?: string
          code_snippet?: string | null
          correct_answer?: string | null
          correct_answer_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          id?: string
          is_active?: boolean | null
          question_text?: string
          question_type?: string
          rubric?: Json | null
          topic_category?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      code_issue_education_mapping: {
        Row: {
          concept_name: string | null
          created_at: string | null
          difficulty: string | null
          has_educational_content: boolean | null
          id: string
          is_active: boolean | null
          issue_type: string
          learning_priority: number | null
          module_id: string | null
          updated_at: string | null
        }
        Insert: {
          concept_name?: string | null
          created_at?: string | null
          difficulty?: string | null
          has_educational_content?: boolean | null
          id?: string
          is_active?: boolean | null
          issue_type: string
          learning_priority?: number | null
          module_id?: string | null
          updated_at?: string | null
        }
        Update: {
          concept_name?: string | null
          created_at?: string | null
          difficulty?: string | null
          has_educational_content?: boolean | null
          id?: string
          is_active?: boolean | null
          issue_type?: string
          learning_priority?: number | null
          module_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_issue_education_mapping_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      competitive_intelligence: {
        Row: {
          analysis_notes: string | null
          competitor_name: string
          competitor_type: string
          created_at: string | null
          customer_base_estimate: number | null
          download_count: number | null
          employee_count: number | null
          funding_raised: number | null
          github_stars: number | null
          id: string
          key_features: Json | null
          last_analyzed_at: string | null
          market_position: string
          market_share_estimate: number | null
          opportunity_areas: Json | null
          partnership_potential: string | null
          pricing_model: string | null
          strengths: Json | null
          threat_level: string | null
          updated_at: string | null
          weaknesses: Json | null
        }
        Insert: {
          analysis_notes?: string | null
          competitor_name: string
          competitor_type: string
          created_at?: string | null
          customer_base_estimate?: number | null
          download_count?: number | null
          employee_count?: number | null
          funding_raised?: number | null
          github_stars?: number | null
          id?: string
          key_features?: Json | null
          last_analyzed_at?: string | null
          market_position: string
          market_share_estimate?: number | null
          opportunity_areas?: Json | null
          partnership_potential?: string | null
          pricing_model?: string | null
          strengths?: Json | null
          threat_level?: string | null
          updated_at?: string | null
          weaknesses?: Json | null
        }
        Update: {
          analysis_notes?: string | null
          competitor_name?: string
          competitor_type?: string
          created_at?: string | null
          customer_base_estimate?: number | null
          download_count?: number | null
          employee_count?: number | null
          funding_raised?: number | null
          github_stars?: number | null
          id?: string
          key_features?: Json | null
          last_analyzed_at?: string | null
          market_position?: string
          market_share_estimate?: number | null
          opportunity_areas?: Json | null
          partnership_potential?: string | null
          pricing_model?: string | null
          strengths?: Json | null
          threat_level?: string | null
          updated_at?: string | null
          weaknesses?: Json | null
        }
        Relationships: []
      }
      custom_rule_usage: {
        Row: {
          applied_at: string | null
          fixes_applied: number | null
          id: string
          issues_found: number | null
          project_id: string | null
          rule_id: string | null
        }
        Insert: {
          applied_at?: string | null
          fixes_applied?: number | null
          id?: string
          issues_found?: number | null
          project_id?: string | null
          rule_id?: string | null
        }
        Update: {
          applied_at?: string | null
          fixes_applied?: number | null
          id?: string
          issues_found?: number | null
          project_id?: string | null
          rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_rule_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "analysis_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_rule_usage_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "analysis_projects_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_rule_usage_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "custom_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_rules: {
        Row: {
          ast_pattern: Json
          auto_fixable: boolean | null
          created_at: string | null
          description: string | null
          fix_template: string | null
          id: string
          is_active: boolean | null
          name: string
          rule_type: string
          severity: string | null
          team_id: string | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          ast_pattern: Json
          auto_fixable?: boolean | null
          created_at?: string | null
          description?: string | null
          fix_template?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          rule_type: string
          severity?: string | null
          team_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          ast_pattern?: Json
          auto_fixable?: boolean | null
          created_at?: string | null
          description?: string | null
          fix_template?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          rule_type?: string
          severity?: string | null
          team_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_rules_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
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
      developer_certifications: {
        Row: {
          badge_earned: Json | null
          certificate_id: string | null
          certification_earned_at: string | null
          certification_expires_at: string | null
          certification_fee_paid: number | null
          certification_level: string
          certification_status: string | null
          code_quality_portfolio: Json | null
          continuing_education_credits: number | null
          created_at: string | null
          developer_id: string | null
          employer_name: string | null
          employer_sponsored: boolean | null
          exam_attempts: number | null
          exam_date: string | null
          exam_score: number | null
          id: string
          max_attempts: number | null
          passing_score: number | null
          payment_status: string | null
          peer_review_score: number | null
          practical_project_score: number | null
          required_credits: number | null
          updated_at: string | null
        }
        Insert: {
          badge_earned?: Json | null
          certificate_id?: string | null
          certification_earned_at?: string | null
          certification_expires_at?: string | null
          certification_fee_paid?: number | null
          certification_level: string
          certification_status?: string | null
          code_quality_portfolio?: Json | null
          continuing_education_credits?: number | null
          created_at?: string | null
          developer_id?: string | null
          employer_name?: string | null
          employer_sponsored?: boolean | null
          exam_attempts?: number | null
          exam_date?: string | null
          exam_score?: number | null
          id?: string
          max_attempts?: number | null
          passing_score?: number | null
          payment_status?: string | null
          peer_review_score?: number | null
          practical_project_score?: number | null
          required_credits?: number | null
          updated_at?: string | null
        }
        Update: {
          badge_earned?: Json | null
          certificate_id?: string | null
          certification_earned_at?: string | null
          certification_expires_at?: string | null
          certification_fee_paid?: number | null
          certification_level?: string
          certification_status?: string | null
          code_quality_portfolio?: Json | null
          continuing_education_credits?: number | null
          created_at?: string | null
          developer_id?: string | null
          employer_name?: string | null
          employer_sponsored?: boolean | null
          exam_attempts?: number | null
          exam_date?: string | null
          exam_score?: number | null
          id?: string
          max_attempts?: number | null
          passing_score?: number | null
          payment_status?: string | null
          peer_review_score?: number | null
          practical_project_score?: number | null
          required_credits?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      educational_modules: {
        Row: {
          average_score: number | null
          category: string
          completion_rate: number | null
          concept_level: string
          created_at: string | null
          description: string
          examples: Json
          id: string
          is_active: boolean | null
          issue_type: string
          quiz: Json
          related_resources: Json | null
          times_shown: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          average_score?: number | null
          category: string
          completion_rate?: number | null
          concept_level: string
          created_at?: string | null
          description: string
          examples: Json
          id?: string
          is_active?: boolean | null
          issue_type: string
          quiz: Json
          related_resources?: Json | null
          times_shown?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          average_score?: number | null
          category?: string
          completion_rate?: number | null
          concept_level?: string
          created_at?: string | null
          description?: string
          examples?: Json
          id?: string
          is_active?: boolean | null
          issue_type?: string
          quiz?: Json
          related_resources?: Json | null
          times_shown?: number | null
          title?: string
          updated_at?: string | null
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
      learning_analytics: {
        Row: {
          created_at: string | null
          event: string
          id: string
          metadata: Json | null
          module_id: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event?: string
          id?: string
          metadata?: Json | null
          module_id?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_analytics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          issue_type: string
          module_id: string
          quiz_score: number | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          issue_type: string
          module_id: string
          quiz_score?: number | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          issue_type?: string
          module_id?: string
          quiz_score?: number | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          total_modules_completed: number | null
          total_score_sum: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_modules_completed?: number | null
          total_score_sum?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          total_modules_completed?: number | null
          total_score_sum?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meta_analysis_results: {
        Row: {
          accuracy_score: number | null
          analysis_id: string | null
          blind_spots_identified: Json | null
          competitive_advantages: Json | null
          created_at: string | null
          f1_score: number | null
          false_positives_by_tool: Json | null
          id: string
          issues_found_by_neurolint: number | null
          issues_found_by_tool: number | null
          issues_missed_by_tool: Json | null
          neurolint_execution_time_ms: number | null
          precision_score: number | null
          recall_score: number | null
          recommendations: Json | null
          target_tool_id: string | null
          test_codebase_language: string
          test_codebase_name: string
          test_codebase_size: number | null
          tool_execution_time_ms: number | null
          unique_insights: Json | null
        }
        Insert: {
          accuracy_score?: number | null
          analysis_id?: string | null
          blind_spots_identified?: Json | null
          competitive_advantages?: Json | null
          created_at?: string | null
          f1_score?: number | null
          false_positives_by_tool?: Json | null
          id?: string
          issues_found_by_neurolint?: number | null
          issues_found_by_tool?: number | null
          issues_missed_by_tool?: Json | null
          neurolint_execution_time_ms?: number | null
          precision_score?: number | null
          recall_score?: number | null
          recommendations?: Json | null
          target_tool_id?: string | null
          test_codebase_language: string
          test_codebase_name: string
          test_codebase_size?: number | null
          tool_execution_time_ms?: number | null
          unique_insights?: Json | null
        }
        Update: {
          accuracy_score?: number | null
          analysis_id?: string | null
          blind_spots_identified?: Json | null
          competitive_advantages?: Json | null
          created_at?: string | null
          f1_score?: number | null
          false_positives_by_tool?: Json | null
          id?: string
          issues_found_by_neurolint?: number | null
          issues_found_by_tool?: number | null
          issues_missed_by_tool?: Json | null
          neurolint_execution_time_ms?: number | null
          precision_score?: number | null
          recall_score?: number | null
          recommendations?: Json | null
          target_tool_id?: string | null
          test_codebase_language?: string
          test_codebase_name?: string
          test_codebase_size?: number | null
          tool_execution_time_ms?: number | null
          unique_insights?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_analysis_results_target_tool_id_fkey"
            columns: ["target_tool_id"]
            isOneToOne: false
            referencedRelation: "meta_analysis_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_analysis_tools: {
        Row: {
          accuracy_benchmark: number | null
          analysis_categories: Json
          api_endpoint: string | null
          created_at: string | null
          documentation_url: string | null
          ease_of_use_rating: number | null
          id: string
          integration_status: string | null
          is_free: boolean | null
          last_benchmarked_at: string | null
          performance_benchmark: number | null
          popularity_score: number | null
          pricing_model: string | null
          supported_languages: Json
          tool_name: string
          tool_type: string
          tool_version: string | null
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          accuracy_benchmark?: number | null
          analysis_categories?: Json
          api_endpoint?: string | null
          created_at?: string | null
          documentation_url?: string | null
          ease_of_use_rating?: number | null
          id?: string
          integration_status?: string | null
          is_free?: boolean | null
          last_benchmarked_at?: string | null
          performance_benchmark?: number | null
          popularity_score?: number | null
          pricing_model?: string | null
          supported_languages?: Json
          tool_name: string
          tool_type: string
          tool_version?: string | null
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          accuracy_benchmark?: number | null
          analysis_categories?: Json
          api_endpoint?: string | null
          created_at?: string | null
          documentation_url?: string | null
          ease_of_use_rating?: number | null
          id?: string
          integration_status?: string | null
          is_free?: boolean | null
          last_benchmarked_at?: string | null
          performance_benchmark?: number | null
          popularity_score?: number | null
          pricing_model?: string | null
          supported_languages?: Json
          tool_name?: string
          tool_type?: string
          tool_version?: string | null
          updated_at?: string | null
          vendor_name?: string | null
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
      nuclear_revenue_streams: {
        Row: {
          amount: number
          contract_reference: string | null
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          recurring_frequency: string | null
          recurring_revenue: boolean | null
          revenue_date: string | null
          revenue_type: string
          source_entity_id: string | null
          source_entity_type: string | null
        }
        Insert: {
          amount: number
          contract_reference?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          recurring_frequency?: string | null
          recurring_revenue?: boolean | null
          revenue_date?: string | null
          revenue_type: string
          source_entity_id?: string | null
          source_entity_type?: string | null
        }
        Update: {
          amount?: number
          contract_reference?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          recurring_frequency?: string | null
          recurring_revenue?: boolean | null
          revenue_date?: string | null
          revenue_type?: string
          source_entity_id?: string | null
          source_entity_type?: string | null
        }
        Relationships: []
      }
      pattern_library: {
        Row: {
          base_license_fee: number | null
          complexity_score: number
          contributor_id: string | null
          created_at: string | null
          discovery_source: string | null
          effectiveness_rating: number | null
          id: string
          is_licensable: boolean | null
          language_support: Json
          license_tier: string | null
          pattern_ast: Json
          pattern_description: string
          pattern_name: string
          pattern_type: string
          severity_level: string
          updated_at: string | null
          usage_frequency: number | null
        }
        Insert: {
          base_license_fee?: number | null
          complexity_score?: number
          contributor_id?: string | null
          created_at?: string | null
          discovery_source?: string | null
          effectiveness_rating?: number | null
          id?: string
          is_licensable?: boolean | null
          language_support?: Json
          license_tier?: string | null
          pattern_ast: Json
          pattern_description: string
          pattern_name: string
          pattern_type: string
          severity_level: string
          updated_at?: string | null
          usage_frequency?: number | null
        }
        Update: {
          base_license_fee?: number | null
          complexity_score?: number
          contributor_id?: string | null
          created_at?: string | null
          discovery_source?: string | null
          effectiveness_rating?: number | null
          id?: string
          is_licensable?: boolean | null
          language_support?: Json
          license_tier?: string | null
          pattern_ast?: Json
          pattern_description?: string
          pattern_name?: string
          pattern_type?: string
          severity_level?: string
          updated_at?: string | null
          usage_frequency?: number | null
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
      reports: {
        Row: {
          created_at: string | null
          data: Json
          date_range: Json
          filters: Json | null
          id: string
          name: string
          team_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          date_range: Json
          filters?: Json | null
          id?: string
          name: string
          team_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          date_range?: Json
          filters?: Json | null
          id?: string
          name?: string
          team_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_equity_agreements: {
        Row: {
          agreement_expires_at: string | null
          agreement_signed_at: string | null
          agreement_status: string | null
          annual_usage_count: number | null
          company_legal_name: string | null
          company_name: string
          company_stage: string
          contract_document_url: string | null
          created_at: string | null
          current_estimated_valuation: number | null
          equity_percentage: number | null
          founder_id: string | null
          id: string
          incorporation_country: string | null
          incorporation_state: string | null
          last_usage_check: string | null
          legal_review_status: string | null
          minimum_usage_threshold: number | null
          trigger_events: Json | null
          updated_at: string | null
          valuation_at_agreement: number | null
          vesting_schedule: Json | null
        }
        Insert: {
          agreement_expires_at?: string | null
          agreement_signed_at?: string | null
          agreement_status?: string | null
          annual_usage_count?: number | null
          company_legal_name?: string | null
          company_name: string
          company_stage: string
          contract_document_url?: string | null
          created_at?: string | null
          current_estimated_valuation?: number | null
          equity_percentage?: number | null
          founder_id?: string | null
          id?: string
          incorporation_country?: string | null
          incorporation_state?: string | null
          last_usage_check?: string | null
          legal_review_status?: string | null
          minimum_usage_threshold?: number | null
          trigger_events?: Json | null
          updated_at?: string | null
          valuation_at_agreement?: number | null
          vesting_schedule?: Json | null
        }
        Update: {
          agreement_expires_at?: string | null
          agreement_signed_at?: string | null
          agreement_status?: string | null
          annual_usage_count?: number | null
          company_legal_name?: string | null
          company_name?: string
          company_stage?: string
          contract_document_url?: string | null
          created_at?: string | null
          current_estimated_valuation?: number | null
          equity_percentage?: number | null
          founder_id?: string | null
          id?: string
          incorporation_country?: string | null
          incorporation_state?: string | null
          last_usage_check?: string | null
          legal_review_status?: string | null
          minimum_usage_threshold?: number | null
          trigger_events?: Json | null
          updated_at?: string | null
          valuation_at_agreement?: number | null
          vesting_schedule?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          paypal_order_id: string | null
          paypal_subscription_id: string | null
          plan: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          paypal_order_id?: string | null
          paypal_subscription_id?: string | null
          plan?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      team_analysis_history: {
        Row: {
          analysis_type: string | null
          id: string
          metrics: Json | null
          performed_by: string | null
          project_id: string | null
          shared_at: string | null
          team_id: string | null
        }
        Insert: {
          analysis_type?: string | null
          id?: string
          metrics?: Json | null
          performed_by?: string | null
          project_id?: string | null
          shared_at?: string | null
          team_id?: string | null
        }
        Update: {
          analysis_type?: string | null
          id?: string
          metrics?: Json | null
          performed_by?: string | null
          project_id?: string | null
          shared_at?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_analysis_history_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_analysis_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "analysis_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_analysis_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "analysis_projects_with_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_analysis_history_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          role: string | null
          team_id: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          role?: string | null
          team_id?: string | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          role?: string | null
          team_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          permissions: Json | null
          role: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
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
          max_members: number | null
          name: string
          owner_id: string | null
          settings: Json | null
          subscription_id: string | null
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name: string
          owner_id?: string | null
          settings?: Json | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          owner_id?: string | null
          settings?: Json | null
          subscription_id?: string | null
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          analyses_count: number | null
          api_calls_count: number | null
          created_at: string | null
          custom_rules_count: number | null
          id: string
          month: string
          reset_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          analyses_count?: number | null
          api_calls_count?: number | null
          created_at?: string | null
          custom_rules_count?: number | null
          id?: string
          month: string
          reset_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          analyses_count?: number | null
          api_calls_count?: number | null
          created_at?: string | null
          custom_rules_count?: number | null
          id?: string
          month?: string
          reset_at?: string | null
          updated_at?: string | null
          user_id?: string | null
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
          key_type: string | null
          last_used_at: string | null
          name: string
          permissions: Json | null
          rate_limit_per_minute: number | null
          team_id: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          key_type?: string | null
          last_used_at?: string | null
          name: string
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          team_id?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          key_type?: string | null
          last_used_at?: string | null
          name?: string
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          team_id?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_api_keys_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_progress: {
        Row: {
          completed_at: string | null
          concepts_mastered: string[] | null
          created_at: string | null
          id: string
          last_accessed: string | null
          module_id: string
          quiz_attempts: Json | null
          status: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          concepts_mastered?: string[] | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          module_id: string
          quiz_attempts?: Json | null
          status?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          concepts_mastered?: string[] | null
          created_at?: string | null
          id?: string
          last_accessed?: string | null
          module_id?: string
          quiz_attempts?: Json | null
          status?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "educational_modules"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      analysis_projects_with_profiles: {
        Row: {
          analysis_results: Json | null
          created_at: string | null
          critical_issues: number | null
          description: string | null
          file_count: number | null
          id: string | null
          name: string | null
          performer_email: string | null
          performer_name: string | null
          shared_with_team: boolean | null
          status: string | null
          team_id: string | null
          total_issues: number | null
          updated_at: string | null
          user_id: string | null
          visibility: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_access_team_feature: {
        Args: { user_uuid: string; feature_name: string }
        Returns: boolean
      }
      generate_api_key: {
        Args: { key_name: string }
        Returns: {
          api_key: string
        }[]
      }
      get_educational_content_for_issue: {
        Args: { issue_type_param: string }
        Returns: {
          module_id: string
          title: string
          description: string
          concept_level: string
          category: string
          has_content: boolean
          learning_priority: number
        }[]
      }
      get_user_teams: {
        Args: { user_uuid: string }
        Returns: {
          team_id: string
          team_name: string
          role: string
          member_count: number
          owner_name: string
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
      track_learning_event: {
        Args: {
          p_user_id: string
          p_module_id: string
          p_event: string
          p_metadata?: Json
          p_session_id?: string
        }
        Returns: undefined
      }
      update_learning_streak: {
        Args: { p_user_id: string }
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
