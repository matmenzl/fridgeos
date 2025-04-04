
/**
 * Thoroughly cleans product names by removing any quantity information
 * like weights, volumes, counts, etc.
 */
export const cleanProductName = (name: string): string => {
  if (!name) return '';
  
  // Step 1: Remove any "Menge: X" patterns (case insensitive)
  let cleaned = name.replace(/Menge:\s*[\d,.]+\s*[a-zA-Z]+/gi, '');
  
  // Step 2: Remove common weight/volume patterns with units at the end of words
  // This covers: 500g, 250g, 500 g, 500gr, 0,5kg, 0.5 kg, 1,5l, 1.5 l, 200ml, etc.
  cleaned = cleaned.replace(/\b\d+[.,]?\d*\s*(?:g|gr|kg|kilo|kilos|kilogramm|l|liter|ml|milliliter|stk|stück|stk\.|pkg|packung|paket)\b/gi, '');
  
  // Step 3: Remove common German product weight formats (like "250g" at the end of product names)
  cleaned = cleaned.replace(/\s+\d+[.,]?\d*\s*(?:g|gr|kg|ml|l)\s*$/gi, '');

  // Step 4: Remove any numbers followed by units anywhere in the text
  cleaned = cleaned.replace(/\d+[.,]?\d*\s*(?:g|gr|kg|l|ml|stk|stück|pkg)\b/gi, '');
  
  // Step 5: Remove common quantity formats in German (like "4ST", "4 ST", "4 Stück")
  cleaned = cleaned.replace(/\b\d+\s*(?:st|stk|stück|pack|packung|p|pcs)\b/gi, '');
  
  // Step 6: Remove just numbers at the beginning or end of a string
  cleaned = cleaned.replace(/^\d+[.,]?\d*\s+/, ''); // Beginning
  cleaned = cleaned.replace(/\s+\d+[.,]?\d*$/, ''); // End
  
  // Step 7: Remove any x format quantities (like "2x" or "2 x")
  cleaned = cleaned.replace(/\b\d+\s*x\s*/gi, '');
  
  // Step 8: Remove quantity enclosed in parentheses or brackets
  cleaned = cleaned.replace(/\(\d+[.,]?\d*\s*(?:g|gr|kg|l|ml|stk|stück|pkg)\)/gi, '');
  cleaned = cleaned.replace(/\[\d+[.,]?\d*\s*(?:g|gr|kg|l|ml|stk|stück|pkg)\]/gi, '');
  
  // Step 9: Remove isolated numbers with optional decimal point that might be weights
  cleaned = cleaned.replace(/\b\d+[.,]?\d*\s*/g, '');
  
  // Step 10: Clean leftover artifacts
  cleaned = cleaned.replace(/^\s*[:,-./]\s*/, '');
  
  // Step 11: Strip trailing units even without numbers (like just "g" at the end)
  cleaned = cleaned.replace(/\s+(?:g|gr|kg|l|ml|stk|stück)$/i, '');
  
  // Step 12: Clean up multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};
