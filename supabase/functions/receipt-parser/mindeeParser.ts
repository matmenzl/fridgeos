
import { LineItem, MindeeResponse, RawLineItem, ReceiptData } from "./types.ts";

/**
 * Extracts product information from Mindee API response
 */
export function extractProductsFromMindee(
  result: MindeeResponse,
  rawReceiptData: ReceiptData
): {
  products: string[];
  rawLineItems: RawLineItem[];
  ocrText: string | null;
  mindeeRawData: any;
} {
  let products: string[] = [];
  let rawLineItems: RawLineItem[] = [];
  let ocrText: string | null = null;
  let mindeeRawData = null;

  // Store the raw prediction
  if (result.document?.inference?.prediction) {
    mindeeRawData = result.document.inference.prediction;
    
    // Extract OCR text if available
    if (result.document.ocr && result.document.ocr.mvision_v1) {
      ocrText = result.document.ocr.mvision_v1.raw_text;
    }
  }
  
  // Extended search for OCR text in various API response formats
  if (!ocrText && result.document?.ocr) {
    // Search through different possible OCR formats
    const ocrData = result.document.ocr;
    if (typeof ocrData === 'object') {
      for (const key in ocrData) {
        if (ocrData[key]?.raw_text) {
          ocrText = ocrData[key].raw_text;
          console.log(`OCR text found in ${key}`);
          break;
        }
      }
    }
  }
  
  // Extract line items
  if (result.document?.inference?.prediction?.line_items) {
    const items = result.document.inference.prediction.line_items;
    console.log(`Found line_items: ${items.length}`);
    
    // Save raw data for diagnostic purposes with all available fields
    rawLineItems = items.map(item => {
      const lineItem: RawLineItem = {};
      
      // Extract all available fields from the line_item
      for (const key in item) {
        if (typeof item[key] === 'object' && item[key] !== null) {
          if (item[key].value !== undefined) {
            lineItem[key] = {
              value: item[key].value,
              confidence: item[key].confidence || null
            };
          }
        } else {
          lineItem[key] = item[key];
        }
      }
      
      return lineItem;
    });
    
    // Extract product names with various fallbacks
    products = extractProductNames(items);
  }
  
  // If no products in line_items, try to extract supplier name
  if (products.length === 0 && rawReceiptData.supplier_name) {
    console.log("No specific products found, using supplier name:", rawReceiptData.supplier_name);
    products.push(`Einkauf bei ${rawReceiptData.supplier_name}`);
  }
  
  // If still no products, try OCR text
  if (products.length === 0 && ocrText) {
    console.log("No products in line_items found, extracting from OCR text");
    products = extractProductsFromOcrText(ocrText);
  }

  return { products, rawLineItems, ocrText, mindeeRawData };
}

/**
 * Extracts product names from line items
 */
function extractProductNames(items: LineItem[]): string[] {
  return items
    .filter(item => {
      // Description can be in different formats
      return (
        (item.description && 
          (typeof item.description === 'object' && item.description.value && item.description.value !== 'string') || 
          (typeof item.description === 'string' && item.description !== 'string')
        ) ||
        item.product_code || 
        item.product_type || 
        item.unit_price || 
        item.total_amount
      );
    })
    .map(item => {
      // Try to get description first
      if (item.description) {
        if (typeof item.description === 'object' && item.description.value && item.description.value !== 'string') {
          return item.description.value;
        } else if (typeof item.description === 'string' && item.description !== 'string') {
          return item.description;
        }
      }
      
      // Fallbacks in priority order
      if (item.product_code) {
        return typeof item.product_code === 'object' ? item.product_code.value : item.product_code;
      }
      if (item.product_type) {
        return typeof item.product_type === 'object' ? item.product_type.value : item.product_type;
      }
      
      // If no description, create one from available data
      const amount = item.total_amount ? 
        (typeof item.total_amount === 'object' ? item.total_amount.value : item.total_amount) : 
        null;
      
      const quantity = item.quantity ? 
        (typeof item.quantity === 'object' ? item.quantity.value : item.quantity) : 
        null;
        
      if (quantity && amount) {
        return `Artikel (${quantity} Stück, ${amount}€)`;
      } else if (amount) {
        return `Artikel für ${amount}€`;
      }
      
      // Last resort: generic product name
      return "Artikel auf Kassenbon";
    });
}

/**
 * Extracts products from OCR text when line items are not available
 */
function extractProductsFromOcrText(ocrText: string): string[] {
  // Simple text extraction from OCR data
  return ocrText.split('\n')
    .map(line => line.trim())
    .filter(line => 
      line.length > 3 && 
      !line.toLowerCase().includes('summe') && 
      !line.toLowerCase().includes('gesamt') && 
      !line.toLowerCase().includes('total') &&
      !line.toLowerCase().includes('mwst') &&
      !line.toLowerCase().includes('ust') &&
      !line.toLowerCase().includes('euro') &&
      !line.toLowerCase().includes('€') &&
      !line.match(/^\d+([,.]\d{2})?$/) && // Exclude pure numbers/prices
      !line.match(/^\d{2}[.:]\d{2}[.:]\d{4}$/) // Exclude date formats
    );
}
