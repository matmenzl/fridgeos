
// Types for Mindee API integration
export interface LineItem {
  confidence?: number;
  description?: string | { value: string; confidence: number };
  page_id?: number;
  quantity?: number;
  total_amount?: number;
  unit_price?: number;
  product_code?: string | { value: string };
  product_type?: string | { value: string };
}

export interface MindeeResponse {
  document?: {
    inference?: {
      prediction?: {
        document_type?: { value: string };
        supplier_name?: { value: string };
        date?: { value: string };
        total_amount?: { value: number };
        line_items?: LineItem[];
      };
    };
    ocr?: any;
    n_pages?: number;
  };
}

export interface RawLineItem {
  [key: string]: any;
}

export interface ReceiptData {
  document_type?: string;
  supplier_name?: string;
  receipt_date?: string;
  total_amount?: number;
}

export interface ParserResponse {
  success: boolean;
  products: string[];
  useTesseract: boolean;
  mindeeError?: string | null;
  debug: {
    line_items_raw: RawLineItem[];
    document_type?: string;
    supplier_name?: string;
    receipt_date?: string;
    total_amount?: number;
    page_count?: number;
    has_line_items: boolean;
    line_items_count: number;
    raw_prediction?: string | null;
    ocr_text?: string | null;
  };
}

export interface RequestBody {
  image: string;
}
