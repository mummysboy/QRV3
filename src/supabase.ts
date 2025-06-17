// File: src/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "./config";

export const supabase = createClient(
  CONFIG.supabaseUrl,
  CONFIG.supabaseAnonKey
);
