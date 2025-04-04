
import { RECEIPT_PRODUCTS_KEY } from './databaseUtils';
import { BaseDataService } from './baseDataService';
import { ProductNote } from './noteStorage';
import { BaseItem } from './types/dataServiceTypes';

// Define the database product type
interface DbProduct {
  id: string;
  product_name: string;
  timestamp: number;
}

class ReceiptProductService extends BaseDataService<ProductNote, DbProduct> {
  constructor() {
    super(
      'receipt_products',
      RECEIPT_PRODUCTS_KEY,
      // Map from DB to ProductNote format
      (dbItem: any): ProductNote => ({
        id: dbItem.id,
        productName: dbItem.product_name,
        timestamp: dbItem.timestamp
      }),
      // Map from ProductNote to DB format
      (product: ProductNote): Omit<DbProduct, 'id'> => ({
        product_name: product.productName,
        timestamp: product.timestamp
      })
    );
  }

  // Method to access localStorage for migration purposes
  getAllFromLocalStorage(): ProductNote[] {
    return super.getFromLocalStorage();
  }
}

// Create a singleton instance
const receiptProductService = new ReceiptProductService();

// Export the service functions
export const saveReceiptProduct = async (productName: string): Promise<ProductNote> => {
  // Ensure we always use the current timestamp when saving a receipt product
  const currentTimestamp = Date.now();
  console.log(`Saving receipt product "${productName}" with timestamp: ${currentTimestamp}`);
  
  const newProduct = await receiptProductService.create({ 
    productName, 
    timestamp: currentTimestamp 
  });
  
  console.log(`Product saved with ID: ${newProduct.id} and timestamp: ${newProduct.timestamp}`);
  return newProduct;
};

export const getAllReceiptProducts = async (): Promise<ProductNote[]> => {
  return receiptProductService.getAll();
};

export const deleteReceiptProduct = async (id: string): Promise<void> => {
  console.log(`Attempting to delete product with ID: ${id}`);
  return receiptProductService.delete(id);
};

export const updateReceiptProduct = async (id: string, productName: string): Promise<ProductNote | null> => {
  return receiptProductService.update(id, { productName });
};

export const migrateReceiptProductsToSupabase = async (): Promise<boolean> => {
  const localProducts = receiptProductService.getAllFromLocalStorage();
  return receiptProductService.migrateToSupabase(localProducts);
};
