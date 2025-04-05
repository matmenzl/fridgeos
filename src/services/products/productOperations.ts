
import { supabase } from '../../integrations/supabase/client';
import { ProductNote } from '../noteStorage';
import { 
  getAllReceiptProductsFromLocalStorage, 
  saveReceiptProductToLocalStorage, 
  deleteReceiptProductFromLocalStorage,
  updateReceiptProductInLocalStorage
} from './productLocalStorage';
import { fetchAllItems } from '../db/supabaseUtils';

/**
 * Funktion zum Speichern eines Kassenbeleg-Produkts in Supabase
 */
export const saveReceiptProduct = async (productName: string): Promise<ProductNote> => {
  // Ein temporäres Produkt erstellen
  const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);
  const newProduct: ProductNote = {
    id: uniqueId,
    productName,
    timestamp: Date.now()
  };
  
  try {
    // In Supabase speichern
    const { data, error } = await supabase
      .from('receipt_products')
      .insert([{
        product_name: newProduct.productName,
        timestamp: newProduct.timestamp
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern des Produkts in Supabase:', error);
      // Fallback: In localStorage speichern
      saveReceiptProductToLocalStorage(newProduct);
    } else if (data) {
      // Die von Supabase generierte UUID verwenden
      newProduct.id = data.id;
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Produkts:', error);
    // Fallback: In localStorage speichern
    saveReceiptProductToLocalStorage(newProduct);
  }
  
  console.log(`Produkt mit ID: ${newProduct.id} gespeichert`);
  return newProduct;
};

/**
 * Funktion zum Abrufen aller Kassenbeleg-Produkte aus Supabase
 */
export const getAllReceiptProducts = async (): Promise<ProductNote[]> => {
  return fetchAllItems<ProductNote>(
    'receipt_products',
    'timestamp',
    getAllReceiptProductsFromLocalStorage,
    (product) => ({
      id: product.id,
      productName: product.product_name,
      timestamp: product.timestamp
    })
  );
};

/**
 * Funktion zum Löschen eines Kassenbeleg-Produkts in Supabase
 */
export const deleteReceiptProduct = async (id: string): Promise<void> => {
  console.log(`Versuche, Produkt mit ID: ${id} zu löschen`);
  
  try {
    const { error } = await supabase
      .from('receipt_products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Fehler beim Löschen des Produkts mit ID ${id} in Supabase:`, error);
      // Fallback: Aus localStorage löschen
      deleteReceiptProductFromLocalStorage(id);
    } else {
      console.log(`Produkt mit ID ${id} erfolgreich aus Supabase gelöscht.`);
    }
  } catch (error) {
    console.error(`Fehler beim Löschen des Produkts mit ID ${id}:`, error);
    // Fallback: Aus localStorage löschen
    deleteReceiptProductFromLocalStorage(id);
  }
};

/**
 * Funktion zum Aktualisieren eines Kassenbeleg-Produkts in Supabase
 */
export const updateReceiptProduct = async (id: string, productName: string): Promise<ProductNote | null> => {
  try {
    const { data, error } = await supabase
      .from('receipt_products')
      .update({ product_name: productName, timestamp: Date.now() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Fehler beim Aktualisieren des Produkts mit ID ${id} in Supabase:`, error);
      // Fallback: In localStorage aktualisieren
      return updateReceiptProductInLocalStorage(id, productName);
    }
    
    if (!data) {
      return null;
    }
    
    // Das aktualisierte Produkt zurückgeben
    return {
      id: data.id,
      productName: data.product_name,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Produkts mit ID ${id}:`, error);
    // Fallback: In localStorage aktualisieren
    return updateReceiptProductInLocalStorage(id, productName);
  }
};

/**
 * Funktion zum Migrieren aller Kassenbeleg-Produkte von localStorage zu Supabase
 */
export const migrateReceiptProductsToSupabase = async (): Promise<boolean> => {
  try {
    const localProducts = getAllReceiptProductsFromLocalStorage();
    
    if (localProducts.length === 0) {
      console.log('Keine lokalen Kassenbeleg-Produkte zum Migrieren gefunden.');
      return true;
    }
    
    // Produkte für Supabase vorbereiten
    const productsForSupabase = localProducts.map(product => ({
      product_name: product.productName,
      timestamp: product.timestamp
    }));
    
    // Produkte in Supabase speichern
    const { error } = await supabase
      .from('receipt_products')
      .insert(productsForSupabase);
    
    if (error) {
      console.error('Fehler beim Migrieren der Kassenbeleg-Produkte zu Supabase:', error);
      return false;
    }
    
    console.log(`${localProducts.length} Kassenbeleg-Produkte erfolgreich zu Supabase migriert.`);
    return true;
  } catch (error) {
    console.error('Fehler beim Migrieren der Kassenbeleg-Produkte:', error);
    return false;
  }
};
