
import { createClient } from '@supabase/supabase-js';

// Use the project ID to construct the Supabase URL
const projectId = 'egnapbasxetmwmvvvsjo';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  `https://${projectId}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmFwYmFzeGV0bXdtdnZ2c2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3Njc2NjUsImV4cCI6MjA1OTM0MzY2NX0.RuDVTbpRG_mgjZ3duHbfTxPjBVPmmTDMdPg6ueDxias';

// We'll still log a warning if the environment variable isn't set
// even though we've hardcoded a fallback value
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('VITE_SUPABASE_ANON_KEY ist nicht in den Umgebungsvariablen gesetzt. Verwende eingebetteten Schlüssel als Fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
