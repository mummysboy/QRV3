// File: src/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "./config";
import type { Database } from "./types/supabase";

export const supabase = createClient<Database>(
  CONFIG.supabaseUrl,
  CONFIG.supabaseAnonKey
);
