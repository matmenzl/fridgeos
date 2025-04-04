
/**
 * Thoroughly cleans product names by removing any quantity information
 * like weights, volumes, counts, etc.
 */
export const cleanProductName = (name: string): string => {
  if (!name) return '';
  
  // Step 1: Remove any "Menge: X" patterns (case insensitive)
  let cleaned = name.replace(/Menge:\s*[\d,.]+\s*[a-zA-Z]+/gi, '');
  
  // Step 2: Remove all quantity patterns with units (handle various formats)
  // This covers: 500g, 500 g, 500gr, 0,5kg, 0.5 kg, 1,5l, 1.5 l, 200ml, 500 milliliter, etc.
  cleaned = cleaned.replace(/\b\d+[.,]?\d*\s*(?:g|gr|kg|kilo|kilos|kilogramm|l|liter|ml|milliliter|stk|stück|stk\.|pkg|packung|paket)\b/gi, '');
  
  // Step 3: Remove just numbers at the beginning of a string (like "500 Kartoffeln")
  cleaned = cleaned.replace(/^\d+[.,]?\d*\s+/, '');
  
  // Step 4: Remove any x format quantities (like "2x" or "2 x")
  cleaned = cleaned.replace(/\b\d+\s*x\s*/gi, '');
  
  // Step 5: Remove quantity enclosed in parentheses
  cleaned = cleaned.replace(/\(\d+[.,]?\d*\s*(?:g|gr|kg|l|ml|stk|stück|pkg)\)/gi, '');
  
  // Step 6: Remove quantity in brackets
  cleaned = cleaned.replace(/\[\d+[.,]?\d*\s*(?:g|gr|kg|l|ml|stk|stück|pkg)\]/gi, '');
  
  // Step 7: Enhanced cleaning of quantities without units (like "250" or "250 ")
  cleaned = cleaned.replace(/\b\d+[.,]?\d*\s*/g, '');
  
  // Step 8: Clean leftover artifacts like colons, commas, etc.
  cleaned = cleaned.replace(/^\s*[:,-./]\s*/, '');
  
  // Step 9: Clean up multiple spaces and trim
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
};
