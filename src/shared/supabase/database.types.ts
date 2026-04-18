/**
 * Hand-written shape of the public schema after the 20260409000001 migration.
 *
 * The contract: every entity table has only the promoted columns needed for
 * RLS / foreign keys / ordering (id, user_id, *_at). Everything else lives
 * inside `data` (JSONB) and is decoded by the module's repository via
 * `fromJson(<Schema>, row.data)` from `@bufbuild/protobuf`. The proto message
 * IS the row — no mapper layer.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      sentences: {
        Row: {
          id: string;
          last_used_at: string | null;
          data: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          last_used_at?: string | null;
          data: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          last_used_at?: string | null;
          data?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      dreams: {
        Row: {
          id: string;
          user_id: string;
          data: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          data: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      actions: {
        Row: {
          id: string;
          user_id: string;
          dream_id: string | null;
          parent_action_id: string | null;
          data: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          dream_id?: string | null;
          parent_action_id?: string | null;
          data: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          dream_id?: string | null;
          parent_action_id?: string | null;
          data?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
