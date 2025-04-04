
import { createClient } from '@supabase/supabase-js';

// Use the project ID to construct the Supabase URL
const projectId = 'egnapbasxetmwmvvvsjo';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  `https://${projectId}.supabase.co`;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmFwYmFzeGV0bXdtdnZ2c2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3Njc2NjUsImV4cCI6MjA1OTM0MzY2NX0.RuDVTbpRG_mgjZ3duHbfTxPjBVPmmTDMdPg6ueDxias';

// Nur in der Entwicklungsumgebung eine Warnung anzeigen
if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.info(
    '%c📌 Hinweis: VITE_SUPABASE_ANON_KEY nicht gesetzt', 
    'font-weight: bold; color: #3b82f6;'
  );
  console.info(
    'Die Anwendung verwendet den eingebetteten API-Schlüssel. Dies ist für die Entwicklung in Ordnung, aber für die Produktion sollten Sie Umgebungsvariablen verwenden.'
  );
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// SQL code for creating the necessary tables
const createTablesSql = `
CREATE TABLE IF NOT EXISTS public.notes (
  id text primary key,
  text text not null,
  timestamp bigint not null
);

CREATE TABLE IF NOT EXISTS public.receipt_products (
  id text primary key,
  productName text not null,
  timestamp bigint not null
);
`;

// Check for tables and inform the user if they need to be created
export const initializeTables = async () => {
  try {
    // Check if 'notes' table exists by querying it
    const { error: checkNotesError } = await supabase
      .from('notes')
      .select('id')
      .limit(1);
      
    // If the table doesn't exist, inform the user
    if (checkNotesError && checkNotesError.code === '42P01') { // 42P01 is PostgreSQL's error code for "table does not exist"
      console.log('Notes table does not exist.');
      console.warn(`
        IMPORTANT: The notes table needs to be created manually. 
        Please create it in the Supabase dashboard with these columns:
        - id (text, primary key)
        - text (text, not null)
        - timestamp (bigint, not null)
      `);
    }

    // Check if 'receipt_products' table exists
    const { error: checkProductsError } = await supabase
      .from('receipt_products')
      .select('id')
      .limit(1);
      
    // If the table doesn't exist, inform the user
    if (checkProductsError && checkProductsError.code === '42P01') {
      console.log('Receipt products table does not exist.');
      console.warn(`
        IMPORTANT: The receipt_products table needs to be created manually. 
        Please create it in the Supabase dashboard with these columns:
        - id (text, primary key)
        - productName (text, not null)
        - timestamp (bigint, not null)
      `);
    }

    // Detect if both tables need to be created
    if ((checkNotesError && checkNotesError.code === '42P01') || 
        (checkProductsError && checkProductsError.code === '42P01')) {
      // Show a more prominent warning in the console
      console.warn('%c⚠️ SUPABASE TABLES MISSING ⚠️', 'font-size: 16px; font-weight: bold; color: red;');
      console.warn('%cPlease go to your Supabase dashboard and create the required tables manually.', 'font-size: 14px;');
      console.warn('%cSee the warning messages above for table structure details or use the SQL below:', 'font-size: 14px;');
      console.warn('%c' + createTablesSql, 'background-color: #f0f0f0; padding: 10px; border-radius: 5px;');
    }

    return { 
      success: true, 
      notesTableExists: !(checkNotesError && checkNotesError.code === '42P01'),
      productsTableExists: !(checkProductsError && checkProductsError.code === '42P01'),
      createTablesSql
    };
  } catch (error) {
    console.error('Table initialization check failed:', error);
    return { success: false, error, createTablesSql };
  }
};
