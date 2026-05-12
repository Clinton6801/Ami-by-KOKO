/**
 * Auto-generated Supabase database types.
 * Run `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`
 * to regenerate after schema changes.
 *
 * Hand-authored for MVP — replace with generated output once Supabase project is linked.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "parent" | "school_admin";
          full_name: string;
          school_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: "parent" | "school_admin";
          full_name: string;
          school_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "parent" | "school_admin";
          full_name?: string;
          school_id?: string | null;
          created_at?: string;
        };
      };
      schools: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          subscription_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          subscription_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          subscription_active?: boolean;
          created_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          parent_id: string | null;
          school_id: string | null;
          name: string;
          age: number | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          school_id?: string | null;
          name: string;
          age?: number | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          school_id?: string | null;
          name?: string;
          age?: number | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          child_id: string;
          language: "english" | "yoruba" | "igbo" | "hausa";
          letter: string;
          heard_count: number;
          traced_count: number;
          mastered: boolean;
          last_activity: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          language: "english" | "yoruba" | "igbo" | "hausa";
          letter: string;
          heard_count?: number;
          traced_count?: number;
          mastered?: boolean;
          last_activity?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          language?: "english" | "yoruba" | "igbo" | "hausa";
          letter?: string;
          heard_count?: number;
          traced_count?: number;
          mastered?: boolean;
          last_activity?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          child_id: string;
          started_at: string;
          ended_at: string | null;
          mode: "phonics" | "dj_booth" | "story";
        };
        Insert: {
          id?: string;
          child_id: string;
          started_at?: string;
          ended_at?: string | null;
          mode: "phonics" | "dj_booth" | "story";
        };
        Update: {
          id?: string;
          child_id?: string;
          started_at?: string;
          ended_at?: string | null;
          mode?: "phonics" | "dj_booth" | "story";
        };
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          plan: "individual" | "school";
          paystack_reference: string | null;
          active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          plan: "individual" | "school";
          paystack_reference?: string | null;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          plan?: "individual" | "school";
          paystack_reference?: string | null;
          active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
