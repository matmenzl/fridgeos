// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ygvocurodighahfjyjnw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlndm9jdXJvZGlnaGFoZmp5am53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODk5NzYsImV4cCI6MjA1OTM2NTk3Nn0._qsIRS1a6rJGF3I6F3uWoRoTpQ1fZTXL5jG4wQ7POas";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);