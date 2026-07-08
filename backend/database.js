import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-side only

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Server-side client uses service role key — bypasses RLS
export const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// Test connection
export const testConnection = async () => {
  const { error } = await supabase.from('users').select('id').limit(1);
  if (error) throw new Error(`Database connection failed: ${error.message}`);
  return true;
};


dotenv.config();
