
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

const STORAGE_KEY = 'speech-notes';
const RECEIPT_PRODUCTS_KEY = 'receipt-products';

export const saveNote = (text: string): Note => {
  const notes = getAllNotes();
  
  const newNote: Note = {
    id: Date.now().toString(),
    text,
    timestamp: Date.now()
  };
  
  notes.push(newNote);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  
  return newNote;
};

export const saveReceiptProduct = (productName: string): ProductNote => {
  const products = getAllReceiptProducts();
  
  const newProduct: ProductNote = {
    id: Date.now().toString(),
    productName,
    timestamp: Date.now()
  };
  
  products.push(newProduct);
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
  
  return newProduct;
};

export const getAllNotes = (): Note[] => {
  const notesJson = localStorage.getItem(STORAGE_KEY);
  return notesJson ? JSON.parse(notesJson) : [];
};

export const getAllReceiptProducts = (): ProductNote[] => {
  const productsJson = localStorage.getItem(RECEIPT_PRODUCTS_KEY);
  return productsJson ? JSON.parse(productsJson) : [];
};

export const deleteNote = (id: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.filter(note => note.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
};

export const deleteReceiptProduct = (id: string): void => {
  const products = getAllReceiptProducts();
  const updatedProducts = products.filter(product => product.id !== id);
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(updatedProducts));
};
