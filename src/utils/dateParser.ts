
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";

/**
 * Attempts to parse a German date string into a Date object
 * Supports formats like "10. April 2025" or "10.04.2025"
 */
export function parseGermanDateFromText(text: string): Date | null {
  try {
    const cleanText = text.toLowerCase();
    let date = null;
    
    // Define month mappings for German
    const months = {
      'januar': 0, 'februar': 1, 'märz': 2, 'april': 3, 'mai': 4, 'juni': 5,
      'juli': 6, 'august': 7, 'september': 8, 'oktober': 9, 'november': 10, 'dezember': 11,
      'jan': 0, 'feb': 1, 'mär': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dez': 11
    };
    
    // Multiple regex patterns to catch different formats
    
    // Pattern 1: "10. April 2025" or "10 April 2025"
    const longFormatRegex = /(\d{1,2})\.?\s?(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|jan|feb|mär|apr|jun|jul|aug|sep|okt|nov|dez)\.?\s?(\d{4}|\d{2})/i;
    
    // Pattern 2: "10.04.2025" or "10-04-2025" or "10/04/2025"
    const numericFormatRegex = /(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4}|\d{2})/;
    
    let match = cleanText.match(longFormatRegex);
    
    if (match) {
      const day = parseInt(match[1], 10);
      const monthName = match[2].toLowerCase();
      const monthIndex = months[monthName as keyof typeof months];
      let year = parseInt(match[3], 10);
      
      // Handle 2-digit years
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
      
      date = new Date(year, monthIndex, day);
    } else {
      // Try numeric format
      match = cleanText.match(numericFormatRegex);
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
        let year = parseInt(match[3], 10);
        
        // Handle 2-digit years
        if (year < 100) {
          year += year < 50 ? 2000 : 1900;
        }
        
        date = new Date(year, month, day);
      }
    }
    
    // Check if we have a valid date and it's not too far in the future (sanity check)
    if (date && !isNaN(date.getTime()) && date > new Date() && date < new Date(2050, 0, 1)) {
      return date;
    }
    
    return null;
  } catch (e) {
    console.error('Failed to parse date from text:', text, e);
    return null;
  }
}

export function formatGermanDate(date: Date): string {
  return format(date, 'dd.MM.yyyy', { locale: de });
}
