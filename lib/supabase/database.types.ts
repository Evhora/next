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
      sentences: {
        Row: {
          id: string
          last_used_at: string | null
          version: number
          data: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          last_used_at?: string | null
          version?: number
          data?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          last_used_at?: string | null
          version?: number
          data?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      dreams: {
        Row: {
          id: string
          user_id: string
          status: number
          status_name: string
          area_of_life: number
          area_of_life_name: string
          version: number
          sequence: number
          data: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status: number
          status_name: string
          area_of_life: number
          area_of_life_name: string
          version?: number
          sequence?: never
          data?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: number
          status_name?: string
          area_of_life?: number
          area_of_life_name?: string
          version?: number
          sequence?: never
          data?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      actions: {
        Row: {
          id: string
          user_id: string
          dream_id: string | null
          parent_action_id: string | null
          status: number
          status_name: string
          version: number
          sequence: number
          data: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          dream_id?: string | null
          parent_action_id?: string | null
          status: number
          status_name: string
          version?: number
          sequence?: never
          data?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          dream_id?: string | null
          parent_action_id?: string | null
          status?: number
          status_name?: string
          version?: number
          sequence?: never
          data?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
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
