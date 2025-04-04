import { RECEIPT_PRODUCTS_KEY } from './databaseUtils';
import { ProductNote } from './noteStorage';

export const saveReceiptProduct = (productName: string): ProductNote => {
  const products = getAllReceiptProducts();
  
  // Create a unique ID by combining timestamp with a random string
  const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 10);
  
  const newProduct: ProductNote = {
    id: uniqueId,
    productName,
    timestamp: Date.now()
  };
  
  products.push(newProduct);
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
  
  console.log(`Saved new product with ID: ${uniqueId}`);
  return newProduct;
};

export const getAllReceiptProducts = (): ProductNote[] => {
  const productsJson = localStorage.getItem(RECEIPT_PRODUCTS_KEY);
  return productsJson ? JSON.parse(productsJson) : [];
};

export const deleteReceiptProduct = (id: string): void => {
  const products = getAllReceiptProducts();
  console.log(`Before deletion: ${products.length} products`);
  console.log(`Product IDs before deletion:`, products.map(p => p.id));
  console.log(`Trying to delete product with ID: ${id}`);
  
  // Make sure we're correctly filtering by ID with strict equality
  const updatedProducts = products.filter(product => {
    // Add detailed logging for each product comparison
    const keep = product.id !== id;
    console.log(`Product ${product.id} (${typeof product.id}) !== ${id} (${typeof id})? ${keep}`);
    return keep;
  });
  
  console.log(`After deletion: ${updatedProducts.length} products`);
  console.log(`Product IDs after deletion:`, updatedProducts.map(p => p.id));
  
  // Save the filtered products back to localStorage
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(updatedProducts));
};

export const updateReceiptProduct = (id: string, productName: string): ProductNote | null => {
  const products = getAllReceiptProducts();
  const productIndex = products.findIndex(product => product.id === id);
  
  if (productIndex === -1) {
    console.error(`Product with ID ${id} not found`);
    return null;
  }
  
  // Update the product with new name, keep the same ID but update timestamp
  const updatedProduct: ProductNote = {
    ...products[productIndex],
    productName,
    timestamp: Date.now()
  };
  
  products[productIndex] = updatedProduct;
  localStorage.setItem(RECEIPT_PRODUCTS_KEY, JSON.stringify(products));
  
  console.log(`Updated product with ID: ${id} to name: ${productName}`);
  return updatedProduct;
};
