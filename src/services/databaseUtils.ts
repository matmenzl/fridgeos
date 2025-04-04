
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

/**
 * Tests the database schema by attempting a sample operation
 * to identify any column name or structure issues
 */
export const testDatabaseSchema = async () => {
  try {
    const { data: sampleProduct, error: sampleError } = await supabase
      .from('receipt_products')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Error checking product schema:', sampleError);
      return { success: false, error: sampleError };
    }
    
    if (sampleProduct && sampleProduct.length > 0) {
      console.log('Product schema columns:', Object.keys(sampleProduct[0]));
    } else {
      console.log('Product table exists but is empty');
    }
    
    const testProduct = {
      id: 'test-' + Date.now().toString(),
      productName: 'Test Product',
      timestamp: Date.now()
    };
    
    console.log('Attempting direct test insert with:', testProduct);
    
    const { data: insertData, error: insertError } = await supabase
      .from('receipt_products')
      .insert(testProduct)
      .select();
    
    if (insertError) {
      console.error('Test insert failed:', insertError);
      
      if (insertError.message && insertError.message.includes('productName')) {
        console.log('Trying alternative column name formats...');
        
        const testSnakeCase = {
          id: 'test-snake-' + Date.now().toString(),
          product_name: 'Test Product Snake Case',
          timestamp: Date.now()
        };
        
        const { error: snakeError } = await supabase
          .from('receipt_products')
          .insert(testSnakeCase);
        
        if (!snakeError) {
          console.log('SUCCESS with snake_case (product_name)');
          return { 
            success: true, 
            message: 'Database uses snake_case (product_name)',
            correctFormat: 'snake_case'
          };
        }
        
        const rawQuery = `
          INSERT INTO receipt_products (id, "productName", timestamp)
          VALUES ('test-raw-${Date.now()}', 'Test Product Raw SQL', ${Date.now()})
        `;
        
        const { error: rawError } = await supabase.rpc('execute_sql', { 
          sql: rawQuery 
        });
        
        if (!rawError) {
          console.log('SUCCESS with raw SQL using quotes');
          return { 
            success: true,
            message: 'Database uses camelCase with quotes ("productName")',
            correctFormat: 'quotedCamel'
          };
        }
      }
      
      return { success: false, error: insertError };
    }
    
    console.log('Test insert successful:', insertData);
    return { success: true, message: 'Schema looks good!' };
  } catch (error) {
    console.error('Schema test failed:', error);
    return { success: false, error };
  }
};

/**
 * Migrates data from local storage to Supabase database
 */
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

/**
 * Retrieves notes from local storage
 */
const getLocalNotes = (): Note[] => {
  const notesJson = localStorage.getItem('speech-notes');
  return notesJson ? JSON.parse(notesJson) : [];
};

/**
 * Retrieves receipt products from local storage
 */
const getLocalReceiptProducts = (): ProductNote[] => {
  const productsJson = localStorage.getItem('receipt-products');
  return productsJson ? JSON.parse(productsJson) : [];
};

/**
 * Tests the connection to Supabase and verifies database schema
 */
export const testSupabaseConnection = async (): Promise<{success: boolean, message: string}> => {
  try {
    const schemaTest = await testDatabaseSchema();
    
    if (!schemaTest.success) {
      return {
        success: false,
        message: `Schema test failed: ${schemaTest.error?.message || 'Unknown error'}`
      };
    }
    
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

// Re-export functions from the other service files for backward compatibility
export { saveNote, getAllNotes, deleteNote } from './noteService';
export { saveReceiptProduct, getAllReceiptProducts, deleteReceiptProduct } from './receiptProductService';
