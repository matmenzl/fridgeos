
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL oder Key fehlt. Bitte überprüfen Sie Ihre Umgebungsvariablen.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
