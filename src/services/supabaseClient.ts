
import { createClient } from '@supabase/supabase-js';

// Definiere Standard-Werte für Entwicklungsumgebungen
// In Produktionsumgebungen müssen diese Werte korrekt gesetzt sein
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  'https://your-supabase-project-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'your-anon-key-for-development-only';

// Warnung nur ausgeben, wenn wir die Standard-Werte verwenden
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL oder Key fehlt in den Umgebungsvariablen. Verwende Standardwerte für die Entwicklungsumgebung.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

