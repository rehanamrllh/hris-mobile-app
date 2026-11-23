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
      leave_requests: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          start_date: string;
          end_date: string;
          reason: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          start_date: string;
          end_date: string;
          reason: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          start_date?: string;
          end_date?: string;
          reason?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      attendance_records: {
        Row: {
          id: string;
          user_id: string;
          work_date: string;
          check_in: string;
          check_out: string | null;
          status: "Tepat Waktu" | "Terlambat";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          work_date: string;
          check_in: string;
          check_out?: string | null;
          status: "Tepat Waktu" | "Terlambat";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          work_date?: string;
          check_in?: string;
          check_out?: string | null;
          status?: "Tepat Waktu" | "Terlambat";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
