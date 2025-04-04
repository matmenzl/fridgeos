
import { createClient } from '@supabase/supabase-js';

// Use the project ID to construct the Supabase URL
const projectId = 'egnapbasxetmwmvvvsjo';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  `https://${projectId}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'your-anon-key-for-development-only';

// Warnung nur ausgeben, wenn wir die Standard-Werte für den Key verwenden
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase Anon Key fehlt in den Umgebungsvariablen. Die Anwendung wird nicht korrekt funktionieren.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
