
import React from 'react';
import { useToast } from "@/hooks/use-toast";

interface TesseractProcessorProps {
  imageUrl: string;
  setProgress: (progress: number) => void;
  onComplete: (products: string[]) => void;
  onError: (error: Error) => void;
}

const TesseractProcessor: React.FC<TesseractProcessorProps> = ({
  imageUrl,
  setProgress,
  onComplete,
  onError
}) => {
  const { toast } = useToast();

  React.useEffect(() => {
    processImageWithTesseract(imageUrl);
  }, [imageUrl]);

  // Fallback OCR with Tesseract.js
  const processImageWithTesseract = async (imageUrl: string) => {
    try {
      setProgress(10);
      toast({
        title: "Lokale Texterkennung gestartet",
        description: "Quittung wird lokal mit Tesseract gescannt...",
      });

      // Check if the image is valid
      if (!imageUrl.startsWith('data:image')) {
        throw new Error('Ungültiges Bildformat. Bitte versuche es erneut mit einem anderen Bild.');
      }

      setProgress(30);

      // Dynamically import Tesseract.js
      const { createWorker, PSM } = await import('tesseract.js');
      
      // Initialize Tesseract worker with optimized options for German receipts
      const worker = await createWorker({
        logger: m => {
          console.log(m);
          if (m.progress !== undefined) {
            // Map Tesseract progress to 30-90%
            setProgress(30 + Math.round(m.progress * 60));
          }
        },
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      });
      
      // Load German language data
      await worker.loadLanguage('deu');
      
      // Configure Tesseract for optimized German receipt scanning
      await worker.initialize('deu');
      
      // Set Tesseract parameters for better receipt recognition
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß0123456789.,€%:;+-/ ',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });
      
      const result = await worker.recognize(imageUrl);
      console.log('OCR Result:', result);
      
      // Process the text to extract product information
      const productLines = filterProductLines(result.data.text);
      
      await worker.terminate();
      
      setProgress(100);
      
      onComplete(productLines);
      
      toast({
        title: "Quittung gescannt",
        description: `${productLines.length} mögliche Produkte mit lokaler Texterkennung identifiziert.`,
      });
    } catch (error) {
      console.error('Tesseract OCR Error:', error);
      const finalError = error instanceof Error ? error : new Error('Unknown OCR error');
      onError(finalError);
      
      toast({
        title: "Fehler bei der Texterkennung",
        description: "Die Quittung konnte nicht verarbeitet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  // Text extraction optimization for German receipts
  const filterProductLines = (text: string): string[] => {
    // Split text into lines and clean them
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);
    
    console.log('Raw OCR lines:', lines);
    
    // German receipt-specific filtering
    const productLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Remove common German receipt headers/footers/metadata
      const isMetadata = 
        lowerLine.includes('gesamt') ||
        lowerLine.includes('summe') ||
        lowerLine.includes('mwst') ||
        lowerLine.includes('ust') ||
        lowerLine.includes('datum') ||
        lowerLine.includes('uhrzeit') ||
        lowerLine.includes('rechnung') ||
        lowerLine.includes('kassenbon') ||
        lowerLine.includes('beleg') ||
        lowerLine.includes('quittung') ||
        lowerLine.includes('vielen dank') ||
        lowerLine.includes('auf wiedersehen') ||
        lowerLine.includes('zwischensumme') ||
        lowerLine.includes('kasse') ||
        lowerLine.includes('filiale') ||
        lowerLine.includes('steuernr') ||
        lowerLine.includes('steuer-nr') ||
        lowerLine.includes('kundennr') ||
        lowerLine.includes('kunden-nr') ||
        lowerLine.includes('tel:') ||
        lowerLine.includes('tel.') ||
        lowerLine.includes('zahlen sie') ||
        lowerLine.includes('zahlung') ||
        lowerLine.includes('betrag');
      
      // Filter out price-only lines (common in German receipts)
      const isPriceLine = /^\s*\d+[.,]\d{2}\s*€?\s*$/.test(line);
      
      // Filter out numbered lines that have just a number and no product name
      const isNumberOnly = /^\s*\d+\s*$/.test(line);
      
      // Potential product lines often have a price
      const hasPrice = /\d+[.,]\d{2}/.test(line);
      
      // Product lines usually have a mix of letters and numbers
      const hasLettersAndDigits = /[A-Za-z].*\d|\d.*[A-Za-z]/.test(line);
      
      // Typical length of product descriptions
      const hasReasonableLength = line.length > 3 && line.length < 60;

      return !isMetadata && !isPriceLine && !isNumberOnly && hasReasonableLength && 
             (hasLettersAndDigits || !hasPrice);
    });
    
    console.log('Filtered product lines:', productLines);
    return productLines;
  };

  return null;
};

export default TesseractProcessor;
