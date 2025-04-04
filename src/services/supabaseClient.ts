
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

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Create tables if they don't exist
export const initializeTables = async () => {
  try {
    // Check if 'notes' table exists by querying it
    const { error: checkNotesError } = await supabase
      .from('notes')
      .select('id')
      .limit(1);
      
    // If the table doesn't exist, create it using SQL via the REST API
    if (checkNotesError && checkNotesError.code === '42P01') { // 42P01 is PostgreSQL's error code for "table does not exist"
      console.log('Notes table does not exist, attempting to create...');
      
      // Use raw SQL via Supabase's functions.invoke method
      const { error: createNotesError } = await supabase.functions.invoke('create-tables', {
        body: { 
          tableName: 'notes',
          columns: [
            { name: 'id', type: 'text', primaryKey: true },
            { name: 'text', type: 'text', notNull: true },
            { name: 'timestamp', type: 'bigint', notNull: true }
          ]
        }
      });
      
      if (createNotesError) {
        console.error('Error creating notes table via edge function:', createNotesError);
        
        // Fallback: Ask user to create the table manually
        console.warn('IMPORTANT: The notes table could not be created automatically. Please create it manually in the Supabase dashboard.');
      }
    }

    // Check if 'receipt_products' table exists
    const { error: checkProductsError } = await supabase
      .from('receipt_products')
      .select('id')
      .limit(1);
      
    // If the table doesn't exist, create it
    if (checkProductsError && checkProductsError.code === '42P01') {
      console.log('Receipt products table does not exist, attempting to create...');
      
      // Use raw SQL via Supabase's functions.invoke method
      const { error: createProductsError } = await supabase.functions.invoke('create-tables', {
        body: { 
          tableName: 'receipt_products',
          columns: [
            { name: 'id', type: 'text', primaryKey: true },
            { name: 'productName', type: 'text', notNull: true },
            { name: 'timestamp', type: 'bigint', notNull: true }
          ]
        }
      });
      
      if (createProductsError) {
        console.error('Error creating receipt_products table via edge function:', createProductsError);
        
        // Fallback: Ask user to create the table manually
        console.warn('IMPORTANT: The receipt_products table could not be created automatically. Please create it manually in the Supabase dashboard.');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Table initialization failed:', error);
    return { success: false, error };
  }
};
