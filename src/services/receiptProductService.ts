
import { supabase } from './supabaseClient';
import { ProductNote, testDatabaseSchema } from './databaseUtils';

/**
 * Saves a new receipt product to the database
 */
export const saveReceiptProduct = async (productName: string): Promise<ProductNote | null> => {
  console.log('Versuche Produkt zu speichern:', productName);
  
  const newProduct = {
    id: Date.now().toString(),
    productName,
    timestamp: Date.now()
  };
  
  try {
    console.log('Sende Produkt an Supabase:', newProduct);
    
    const { data, error } = await supabase
      .from('receipt_products')
      .insert(newProduct)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern des Produkts:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      
      await testDatabaseSchema();
      return null;
    }
    
    console.log('Produkt erfolgreich gespeichert:', data);
    return data;
  } catch (error) {
    console.error('Exception beim Speichern des Produkts:', error);
    if (error instanceof Error) {
      console.error('Fehlerdetails:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
};

/**
 * Retrieves all receipt products from the database
 */
export const getAllReceiptProducts = async (): Promise<ProductNote[]> => {
  console.log('Rufe alle Produkte ab...');
  try {
    const { data, error } = await supabase
      .from('receipt_products')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Produkte:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return [];
    }
    
    console.log(`${data?.length || 0} Produkte erfolgreich abgerufen`);
    return data || [];
  } catch (error) {
    console.error('Exception beim Abrufen der Produkte:', error);
    if (error instanceof Error) {
      console.error('Fehlerdetails:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return [];
  }
};

/**
 * Deletes a receipt product from the database
 */
export const deleteReceiptProduct = async (id: string): Promise<boolean> => {
  console.log('Lösche Produkt mit ID:', id);
  try {
    const { error } = await supabase
      .from('receipt_products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fehler beim Löschen des Produkts:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return false;
    }
    
    console.log('Produkt erfolgreich gelöscht');
    return true;
  } catch (error) {
    console.error('Exception beim Löschen des Produkts:', error);
    if (error instanceof Error) {
      console.error('Fehlerdetails:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
};
