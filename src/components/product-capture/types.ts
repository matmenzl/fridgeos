
export interface ProductFormValues {
  product: string;
  expiryDate: Date | undefined;
  quantity: string;
}

export type CurrentFieldType = 'product' | 'expiryDate' | 'quantity';

export interface ScannedProduct {
  id: string;
  name: string;
}
