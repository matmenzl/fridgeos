
import { supabase } from '../../integrations/supabase/client';

/**
 * Common utilities for Supabase database operations
 */

/**
 * Function to handle Supabase errors with localStorage fallback
 * @param error The Supabase error
 * @param fallbackFn The fallback function to execute if there's an error
 */
export const handleSupabaseError = (error: any, fallbackFn: () => void) => {
  console.error('Supabase operation error:', error);
  // Execute fallback operation
  fallbackFn();
};

/**
 * Generic function to fetch all items from a Supabase table with fallback
 * @param tableName The Supabase table name
 * @param orderColumn The column to order by
 * @param getFallbackItems Function to get items from localStorage if Supabase fails
 * @param mapFunction Function to map database items to application format
 */
export const fetchAllItems = async <T>(
  tableName: string,
  orderColumn: string,
  getFallbackItems: () => T[],
  mapFunction: (item: any) => T
): Promise<T[]> => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderColumn, { ascending: false });
    
    if (error) {
      console.error(`Fehler beim Abrufen der Daten aus ${tableName}:`, error);
      // Fallback: Aus localStorage abrufen
      return getFallbackItems();
    }
    
    if (!data) {
      return getFallbackItems();
    }
    
    // Items in das richtige Format konvertieren
    return data.map(mapFunction);
  } catch (error) {
    console.error(`Fehler beim Abrufen der Daten aus ${tableName}:`, error);
    // Fallback: Aus localStorage abrufen
    return getFallbackItems();
  }
};
