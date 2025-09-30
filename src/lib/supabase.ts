import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table definitions
export interface SupabaseTimelineSchedule {
  id?: number;
  package_id: string;
  sub_document_id?: string;
  document_id: string;
  document_name: string;
  scheduled_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseDocumentLink {
  id?: number;
  package_id: string;
  document_id: string;
  document_name: string;
  link_url: string;
  created_at?: string;
  updated_at?: string;
}
