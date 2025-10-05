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

export interface SupabaseAdditionalDocumentData {
  id?: number;
  package_id: string;
  sub_document_id: string;
  document_id: string;
  document_name: string;
  // Kolom untuk sub document 1 (Balai)
  kak?: string;
  // Kolom untuk sub document 2 (Direktorat Irigasi dan Rawa)
  nota_dinas_dir_irigasi_ke_ditjen?: string;
  nota_dinas_dit_irwa_ke_ki?: string;
  created_at?: string;
  updated_at?: string;
}
