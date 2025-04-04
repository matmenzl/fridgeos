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

export const migrateLocalDataToSupabase = async () => {
  try {
    await initializeTables();
    
    const localNotes = getLocalNotes();
    const localProducts = getLocalReceiptProducts();
    
    if (localNotes.length > 0) {
      for (const note of localNotes) {
        await saveNote(note.text);
      }
      localStorage.removeItem('speech-notes');
    }
    
    if (localProducts.length > 0) {
      for (const product of localProducts) {
        await saveReceiptProduct(product.productName);
      }
      localStorage.removeItem('receipt-products');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Fehler bei der Migration:', error);
    return { success: false, error };
  }
};

const getLocalNotes = (): Note[] => {
  const notesJson = localStorage.getItem('speech-notes');
  return notesJson ? JSON.parse(notesJson) : [];
};

const getLocalReceiptProducts = (): ProductNote[] => {
  const productsJson = localStorage.getItem('receipt-products');
  return productsJson ? JSON.parse(productsJson) : [];
};

export const saveNote = async (text: string): Promise<Note | null> => {
  console.log('Versuche Notiz zu speichern:', text);
  
  const newNote = {
    id: Date.now().toString(),
    text,
    timestamp: Date.now()
  };
  
  try {
    console.log('Sende Notiz an Supabase:', newNote);
    
    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern der Notiz:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return null;
    }
    
    console.log('Notiz erfolgreich gespeichert:', data);
    return data;
  } catch (error) {
    console.error('Exception beim Speichern der Notiz:', error);
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

export const getAllNotes = async (): Promise<Note[]> => {
  console.log('Rufe alle Notizen ab...');
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Notizen:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return [];
    }
    
    console.log(`${data?.length || 0} Notizen erfolgreich abgerufen`);
    return data || [];
  } catch (error) {
    console.error('Exception beim Abrufen der Notizen:', error);
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

export const deleteNote = async (id: string): Promise<boolean> => {
  console.log('Lösche Notiz mit ID:', id);
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return false;
    }
    
    console.log('Notiz erfolgreich gelöscht');
    return true;
  } catch (error) {
    console.error('Exception beim Löschen der Notiz:', error);
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

export const testSupabaseConnection = async (): Promise<{success: boolean, message: string}> => {
  try {
    const { error } = await supabase.from('notes').select('id').limit(1);
    
    if (error) {
      console.error('Verbindungstest fehlgeschlagen:', error);
      return {
        success: false,
        message: `Verbindung fehlgeschlagen: ${error.message} (Code: ${error.code})`
      };
    }
    
    return {
      success: true,
      message: 'Verbindung zu Supabase erfolgreich hergestellt'
    };
  } catch (error) {
    console.error('Fehler beim Verbindungstest:', error);
    return {
      success: false,
      message: `Unerwarteter Fehler: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};
