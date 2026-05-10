import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Variables de Supabase no definidas. Por favor configura tu .env.local o Vercel.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
