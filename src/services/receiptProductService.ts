
import { RECEIPT_PRODUCTS_KEY } from './databaseUtils';
import { ProductNote } from './noteStorage';

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

export const getAllReceiptProducts = (): ProductNote[] => {
  const productsJson = localStorage.getItem(RECEIPT_PRODUCTS_KEY);
  return productsJson ? JSON.parse(productsJson) : [];
};

export const deleteReceiptProduct = (id: string): void => {
  const products = getAllReceiptProducts();
  console.log(`Before deletion: ${products.length} products`);
  
  // Filter out ONLY the product with the matching ID
  const updatedProducts = products.filter(product => product.id !== id);
  
  console.log(`After deletion: ${updatedProducts.length} products`);
  console.log(`Deleted product ID: ${id}`);
  
  // Save the filtered products back to localStorage
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(updatedProducts));
};
