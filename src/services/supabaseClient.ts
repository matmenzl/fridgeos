
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
    // Check if 'notes' table exists, if not create it
    const { error: notesError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'notes',
      columns: `
        id text primary key,
        text text not null,
        timestamp bigint not null
      `
    });

    if (notesError) {
      console.error('Error creating notes table:', notesError);
      
      // Fallback: Try direct SQL (requires create table permissions)
      const { error: fallbackNotesError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.notes (
          id text primary key,
          text text not null,
          timestamp bigint not null
        );
      `);
      
      if (fallbackNotesError) {
        console.error('Error in fallback notes table creation:', fallbackNotesError);
      }
    }

    // Check if 'receipt_products' table exists, if not create it
    const { error: productsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'receipt_products',
      columns: `
        id text primary key,
        productName text not null,
        timestamp bigint not null
      `
    });

    if (productsError) {
      console.error('Error creating receipt_products table:', productsError);
      
      // Fallback: Try direct SQL
      const { error: fallbackProductsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS public.receipt_products (
          id text primary key,
          productName text not null,
          timestamp bigint not null
        );
      `);
      
      if (fallbackProductsError) {
        console.error('Error in fallback receipt_products table creation:', fallbackProductsError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Table initialization failed:', error);
    return { success: false, error };
  }
};
