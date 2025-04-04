
import { RECEIPT_PRODUCTS_KEY } from './databaseUtils';
import { BaseDataService } from './baseDataService';
import { ProductNote } from './noteStorage';

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

  // Special methods specific to receipt products could be added here
}

// Create a singleton instance
const receiptProductService = new ReceiptProductService();

// Export the service functions
export const saveReceiptProduct = async (productName: string): Promise<ProductNote> => {
  const newProduct = await receiptProductService.create({ productName, timestamp: Date.now() });
  console.log(`Produkt mit ID: ${newProduct.id} gespeichert`);
  return newProduct;
};

export const getAllReceiptProducts = async (): Promise<ProductNote[]> => {
  return receiptProductService.getAll();
};

export const deleteReceiptProduct = async (id: string): Promise<void> => {
  console.log(`Versuche, Produkt mit ID: ${id} zu löschen`);
  return receiptProductService.delete(id);
};

export const updateReceiptProduct = async (id: string, productName: string): Promise<ProductNote | null> => {
  return receiptProductService.update(id, { productName });
};

export const migrateReceiptProductsToSupabase = async (): Promise<boolean> => {
  const localProducts = receiptProductService.getFromLocalStorage();
  return receiptProductService.migrateToSupabase(localProducts);
};
