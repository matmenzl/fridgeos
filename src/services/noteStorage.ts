
// Barrel file that re-exports everything for backward compatibility

// Define interfaces
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

// Export storage keys
export { STORAGE_KEY, RECEIPT_PRODUCTS_KEY } from './databaseUtils';

// Re-export note functions
export { 
  saveNote,
  getAllNotes,
  deleteNote
} from './noteService';

// Re-export receipt product functions
export { 
  saveReceiptProduct,
  getAllReceiptProducts,
  deleteReceiptProduct
} from './receiptProductService';
