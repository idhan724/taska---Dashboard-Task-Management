import type { Database } from "@/types/supabase";
import { createClient as _createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isLiveMode = !!(supabaseUrl && supabaseAnonKey);

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[Taska] Supabase env vars tidak ditemukan. " +
      "Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env " +
      "untuk menggunakan live mode."
    );
  }
  return _createClient<Database>(supabaseUrl, supabaseAnonKey);
}


export const supabase = ( isLiveMode ? createClient() : null ) as ReturnType<typeof createClient>;