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
      billing_customers: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_name: string;
          provider_customer_id: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          provider_name: string;
          provider_customer_id: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          provider_name?: string;
          provider_customer_id?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_products: {
        Row: {
          id: string;
          provider: string;
          provider_name: string;
          active: boolean;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          provider: string;
          provider_name: string;
          active?: boolean;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          provider_name?: string;
          active?: boolean;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_prices: {
        Row: {
          id: string;
          provider: string;
          provider_name: string;
          product_id: string;
          active: boolean;
          currency: string;
          unit_amount: number | null;
          interval: string | null;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          provider: string;
          provider_name: string;
          product_id: string;
          active?: boolean;
          currency: string;
          unit_amount?: number | null;
          interval?: string | null;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          provider_name?: string;
          product_id?: string;
          active?: boolean;
          currency?: string;
          unit_amount?: number | null;
          interval?: string | null;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_name: string;
          price_id: string | null;
          status: string;
          status_name: string;
          trial_end: string | null;
          current_period_end: string | null;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          provider: string;
          provider_name: string;
          price_id?: string | null;
          status: string;
          status_name: string;
          trial_end?: string | null;
          current_period_end?: string | null;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          provider_name?: string;
          price_id?: string | null;
          status?: string;
          status_name?: string;
          trial_end?: string | null;
          current_period_end?: string | null;
          data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      billing_invoices: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_name: string;
          subscription_id: string | null;
          status: string;
          status_name: string;
          amount_due: number;
          amount_paid: number;
          currency: string;
          number: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          provider: string;
          provider_name: string;
          subscription_id?: string | null;
          status: string;
          status_name: string;
          amount_due?: number;
          amount_paid?: number;
          currency: string;
          number?: string;
          data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          provider_name?: string;
          subscription_id?: string | null;
          status?: string;
          status_name?: string;
          amount_due?: number;
          amount_paid?: number;
          currency?: string;
          number?: string;
          data?: Json;
          created_at?: string;
          updated_at?: string;
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
