export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      calendar_projects: {
        Row: {
          created_at: string;
          description: string;
          end_date: string;
          id: string;
          name: string;
          start_date: string;
          status: Database["public"]["Enums"]["calendar_project_status"];
          type: Database["public"]["Enums"]["calendar_project_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string;
          end_date: string;
          id?: string;
          name: string;
          start_date: string;
          status?: Database["public"]["Enums"]["calendar_project_status"];
          type?: Database["public"]["Enums"]["calendar_project_type"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          end_date?: string;
          id?: string;
          name?: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["calendar_project_status"];
          type?: Database["public"]["Enums"]["calendar_project_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: Record<string, never>;
    Enums: {
      calendar_project_status:
        | "completed"
        | "scheduled"
        | "in_progress"
        | "pending"
        | "cancelled";
      calendar_project_type:
        | "work"
        | "cursor_project"
        | "workout"
        | "personal"
        | "key_event";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type CalendarProjectRow =
  Database["public"]["Tables"]["calendar_projects"]["Row"];

export type CalendarProjectInsert =
  Database["public"]["Tables"]["calendar_projects"]["Insert"];

export type CalendarProjectUpdate =
  Database["public"]["Tables"]["calendar_projects"]["Update"];
