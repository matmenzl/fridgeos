
import { supabase, initializeTables } from './supabaseClient';

export interface Note {
  id: string;
  text: string;
  timestamp: number;
}

export interface ProductNote {
  id: string;
  productName: string;
  timestamp: number;
}

// Migration-Funktion, um lokale Daten nach Supabase zu übertragen
export const migrateLocalDataToSupabase = async () => {
  try {
    // Initialize tables first
    await initializeTables();
    
    // Lokale Daten abrufen
    const localNotes = getLocalNotes();
    const localProducts = getLocalReceiptProducts();
    
    // Zu Supabase übertragen, wenn vorhanden
    if (localNotes.length > 0) {
      for (const note of localNotes) {
        await saveNote(note.text);
      }
      // Lokale Notizen löschen
      localStorage.removeItem('speech-notes');
    }
    
    if (localProducts.length > 0) {
      for (const product of localProducts) {
        await saveReceiptProduct(product.productName);
      }
      // Lokale Produkte löschen
      localStorage.removeItem('receipt-products');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Fehler bei der Migration:', error);
    return { success: false, error };
  }
};

// Helfer-Funktionen für lokale Daten
const getLocalNotes = (): Note[] => {
  const notesJson = localStorage.getItem('speech-notes');
  return notesJson ? JSON.parse(notesJson) : [];
};

const getLocalReceiptProducts = (): ProductNote[] => {
  const productsJson = localStorage.getItem('receipt-products');
  return productsJson ? JSON.parse(productsJson) : [];
};

// CRUD-Operationen mit Supabase
export const saveNote = async (text: string): Promise<Note | null> => {
  const newNote = {
    id: Date.now().toString(),
    text,
    timestamp: Date.now()
  };
  
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern der Notiz:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception beim Speichern der Notiz:', error);
    return null;
  }
};

export const saveReceiptProduct = async (productName: string): Promise<ProductNote | null> => {
  const newProduct = {
    id: Date.now().toString(),
    productName,
    timestamp: Date.now()
  };
  
  try {
    const { data, error } = await supabase
      .from('receipt_products')
      .insert(newProduct)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern des Produkts:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception beim Speichern des Produkts:', error);
    return null;
  }
};

export const getAllNotes = async (): Promise<Note[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Notizen:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception beim Abrufen der Notizen:', error);
    return [];
  }
};

export const getAllReceiptProducts = async (): Promise<ProductNote[]> => {
  try {
    const { data, error } = await supabase
      .from('receipt_products')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Produkte:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception beim Abrufen der Produkte:', error);
    return [];
  }
};

export const deleteNote = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception beim Löschen der Notiz:', error);
    return false;
  }
};

export const deleteReceiptProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('receipt_products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fehler beim Löschen des Produkts:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception beim Löschen des Produkts:', error);
    return false;
  }
};
