import type { Database } from "@/types/supabase";
import { createClient as _createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

const hasCredentials = !!(supabaseUrl && supabaseAnonKey);
const isBrowserOnline =
  typeof navigator === "undefined" ? true : navigator.onLine;

export const isLiveMode = hasCredentials && isBrowserOnline;

export function createClient() {
  if (!hasCredentials) {
    throw new Error(
      "[Taska] Supabase env vars not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to use live mode.",
    );
  }
  return _createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export const supabase = (isLiveMode ? createClient() : null) as ReturnType<
  typeof createClient
>;
