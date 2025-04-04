
import { RECEIPT_PRODUCTS_KEY } from './databaseUtils';
import { ProductNote } from './noteStorage';
import { supabase } from '../integrations/supabase/client';

// Hilfsfunktion zum Abrufen aller Kassenbeleg-Produkte aus localStorage
const getAllReceiptProductsFromLocalStorage = (): ProductNote[] => {
  const productsJson = localStorage.getItem(RECEIPT_PRODUCTS_KEY);
  return productsJson ? JSON.parse(productsJson) : [];
};

// Funktion zum Speichern eines Kassenbeleg-Produkts in Supabase
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
      const products = getAllReceiptProductsFromLocalStorage();
      products.push(newProduct);
      localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
    } else {
      // Die von Supabase generierte UUID verwenden
      newProduct.id = data.id;
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Produkts:', error);
    // Fallback: In localStorage speichern
    const products = getAllReceiptProductsFromLocalStorage();
    products.push(newProduct);
    localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
  }
  
  console.log(`Produkt mit ID: ${newProduct.id} gespeichert`);
  return newProduct;
};

// Funktion zum Abrufen aller Kassenbeleg-Produkte aus Supabase
export const getAllReceiptProducts = async (): Promise<ProductNote[]> => {
  try {
    const { data, error } = await supabase
      .from('receipt_products')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Produkte aus Supabase:', error);
      // Fallback: Aus localStorage abrufen
      return getAllReceiptProductsFromLocalStorage();
    }
    
    // Produkte in das richtige Format konvertieren
    return data.map(product => ({
      id: product.id,
      productName: product.product_name,
      timestamp: product.timestamp
    }));
  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte:', error);
    // Fallback: Aus localStorage abrufen
    return getAllReceiptProductsFromLocalStorage();
  }
};

// Funktion zum Löschen eines Kassenbeleg-Produkts in Supabase
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
      const products = getAllReceiptProductsFromLocalStorage();
      console.log(`Produkte vor dem Löschen: ${products.length}`);
      const updatedProducts = products.filter(product => product.id !== id);
      console.log(`Produkte nach dem Löschen: ${updatedProducts.length}`);
      localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(updatedProducts));
    } else {
      console.log(`Produkt mit ID ${id} erfolgreich aus Supabase gelöscht.`);
    }
  } catch (error) {
    console.error(`Fehler beim Löschen des Produkts mit ID ${id}:`, error);
    // Fallback: Aus localStorage löschen
    const products = getAllReceiptProductsFromLocalStorage();
    const updatedProducts = products.filter(product => product.id !== id);
    localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(updatedProducts));
  }
};

// Funktion zum Aktualisieren eines Kassenbeleg-Produkts in Supabase
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
      const products = getAllReceiptProductsFromLocalStorage();
      const productIndex = products.findIndex(product => product.id === id);
      
      if (productIndex === -1) {
        console.error(`Produkt mit ID ${id} nicht gefunden`);
        return null;
      }
      
      const updatedProduct: ProductNote = {
        ...products[productIndex],
        productName,
        timestamp: Date.now()
      };
      
      products[productIndex] = updatedProduct;
      localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
      
      return updatedProduct;
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
    const products = getAllReceiptProductsFromLocalStorage();
    const productIndex = products.findIndex(product => product.id === id);
    
    if (productIndex === -1) {
      console.error(`Produkt mit ID ${id} nicht gefunden`);
      return null;
    }
    
    const updatedProduct: ProductNote = {
      ...products[productIndex],
      productName,
      timestamp: Date.now()
    };
    
    products[productIndex] = updatedProduct;
    localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
    
    return updatedProduct;
  }
};

// Funktion zum Migrieren aller Kassenbeleg-Produkte von localStorage zu Supabase
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
