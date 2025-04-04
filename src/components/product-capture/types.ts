
export interface ProductFormValues {
  product: string;
  expiryDate?: Date;
  quantity: string;
  id?: string;
  isVoiceNote?: boolean;
}

export type CurrentFieldType = 'product' | 'expiryDate' | 'quantity';

export interface ScannedProduct {
  id: string;
  name: string;
}
