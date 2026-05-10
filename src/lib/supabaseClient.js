import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables de Supabase no definidas. Usando las hardcodeadas temporalmente.');
}

// Inicializamos el cliente. Por defecto usa import.meta.env, si falla, cae en las variables anteriores.
export const supabase = createClient(
  supabaseUrl || 'https://mnybxjxryqxfqwrkjrlh.supabase.co',
  supabaseKey || 'sb_publishable_GV98DPyQhpjNvT1OjoS7VQ_8-DyCaCb'
);
