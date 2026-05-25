import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

// Verify if credentials are valid and distinct from template placeholders
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== "your_supabase_project_url" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your_supabase_anon_key"
);

if (!isSupabaseConfigured) {
  console.warn(
    "STAHIZZA Warning: Supabase credentials are missing or default. Falling back to local/localStorage mode."
  );
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "placeholder-key"
);
