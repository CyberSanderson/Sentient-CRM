import { createClient } from '@supabase/supabase-js';

// 1. Get the keys from the .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 2. Safety Check: Warn if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('WARNING: Supabase keys are missing in .env file!');
}

// 3. Create and export the "client"
export const supabase = createClient(supabaseUrl, supabaseAnonKey);