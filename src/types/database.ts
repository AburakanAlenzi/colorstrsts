export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'user' | 'admin' | 'super_admin'
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      chemical_tests: {
        Row: {
          id: string
          method_name: string
          method_name_ar: string
          description: string
          description_ar: string
          category: 'basic' | 'advanced' | 'specialized'
          safety_level: 'low' | 'medium' | 'high' | 'extreme'
          preparation_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          method_name: string
          method_name_ar: string
          description: string
          description_ar: string
          category?: 'basic' | 'advanced' | 'specialized'
          safety_level?: 'low' | 'medium' | 'high' | 'extreme'
          preparation_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          method_name?: string
          method_name_ar?: string
          description?: string
          description_ar?: string
          category?: 'basic' | 'advanced' | 'specialized'
          safety_level?: 'low' | 'medium' | 'high' | 'extreme'
          preparation_time?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      color_results: {
        Row: {
          id: string
          test_id: string
          color_result: string
          color_result_ar: string
          color_hex: string
          possible_substance: string
          possible_substance_ar: string
          confidence_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          test_id: string
          color_result: string
          color_result_ar: string
          color_hex: string
          possible_substance: string
          possible_substance_ar: string
          confidence_level?: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          color_result?: string
          color_result_ar?: string
          color_hex?: string
          possible_substance?: string
          possible_substance_ar?: string
          confidence_level?: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "color_results_test_id_fkey"
            columns: ["test_id"]
            referencedRelation: "chemical_tests"
            referencedColumns: ["id"]
          }
        ]
      }
      test_sessions: {
        Row: {
          id: string
          user_id: string | null
          test_id: string
          status: 'started' | 'in_progress' | 'completed' | 'cancelled'
          started_at: string
          completed_at: string | null
          session_data: Json
        }
        Insert: {
          id?: string
          user_id?: string | null
          test_id: string
          status?: 'started' | 'in_progress' | 'completed' | 'cancelled'
          started_at?: string
          completed_at?: string | null
          session_data?: Json
        }
        Update: {
          id?: string
          user_id?: string | null
          test_id?: string
          status?: 'started' | 'in_progress' | 'completed' | 'cancelled'
          started_at?: string
          completed_at?: string | null
          session_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_test_id_fkey"
            columns: ["test_id"]
            referencedRelation: "chemical_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      test_results: {
        Row: {
          id: string
          session_id: string
          color_result_id: string
          confidence_score: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          color_result_id: string
          confidence_score?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          color_result_id?: string
          confidence_score?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_color_result_id_fkey"
            columns: ["color_result_id"]
            referencedRelation: "color_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "test_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      test_instructions: {
        Row: {
          id: string
          test_id: string
          step_number: number
          instruction: string
          instruction_ar: string
          safety_warning: string | null
          safety_warning_ar: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          step_number: number
          instruction: string
          instruction_ar: string
          safety_warning?: string | null
          safety_warning_ar?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          step_number?: number
          instruction?: string
          instruction_ar?: string
          safety_warning?: string | null
          safety_warning_ar?: string | null
          image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_instructions_test_id_fkey"
            columns: ["test_id"]
            referencedRelation: "chemical_tests"
            referencedColumns: ["id"]
          }
        ]
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          details?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      user_role: 'user' | 'admin' | 'super_admin'
      test_category: 'basic' | 'advanced' | 'specialized'
      safety_level: 'low' | 'medium' | 'high' | 'extreme'
      confidence_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
      session_status: 'started' | 'in_progress' | 'completed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
