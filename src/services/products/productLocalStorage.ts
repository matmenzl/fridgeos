
import { RECEIPT_PRODUCTS_KEY } from '../databaseUtils';
import { ProductNote } from '../noteStorage';

/**
 * Get all receipt products from localStorage
 */
export const getAllReceiptProductsFromLocalStorage = (): ProductNote[] => {
  const productsJson = localStorage.getItem(RECEIPT_PRODUCTS_KEY);
  return productsJson ? JSON.parse(productsJson) : [];
};

/**
 * Save a receipt product to localStorage
 */
export const saveReceiptProductToLocalStorage = (product: ProductNote): void => {
  const products = getAllReceiptProductsFromLocalStorage();
  products.push(product);
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
};

/**
 * Delete a receipt product from localStorage
 */
export const deleteReceiptProductFromLocalStorage = (id: string): void => {
  const products = getAllReceiptProductsFromLocalStorage();
  console.log(`Produkte vor dem Löschen: ${products.length}`);
  const updatedProducts = products.filter(product => product.id !== id);
  console.log(`Produkte nach dem Löschen: ${updatedProducts.length}`);
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(updatedProducts));
};

/**
 * Update a receipt product in localStorage
 */
export const updateReceiptProductInLocalStorage = (id: string, productName: string): ProductNote | null => {
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
};
