
import React from 'react';
import { createWorker } from 'tesseract.js';
import { useToast } from "@/hooks/use-toast";

interface OcrProcessorProps {
  imageUrl: string;
  onProcessingStart: () => void;
  onProcessingComplete: (results: string[]) => void;
  onError: (error: Error) => void;
}

const OcrProcessor: React.FC<OcrProcessorProps> = ({
  imageUrl,
  onProcessingStart,
  onProcessingComplete,
  onError
}) => {
  const { toast } = useToast();

  React.useEffect(() => {
    if (imageUrl) {
      processImage(imageUrl);
    }
  }, [imageUrl]);

  const processImage = async (imageUrl: string) => {
    onProcessingStart();
    
    try {
      toast({
        title: "Verarbeitung gestartet",
        description: "Bitte warte, während die Quittung gescannt wird...",
      });

      // Initialize Tesseract worker with proper options
      const worker = await createWorker({
        logger: m => console.log(m),
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      });
      
      // Load German language data
      await worker.loadLanguage('deu');
      await worker.initialize('deu');
      
      const result = await worker.recognize(imageUrl);
      console.log('OCR Result:', result);
      
      // Process the text to extract product information
      const lines = result.data.text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 2); // Filter out very short lines
      
      // Simple filtering to find potential product lines
      const productLines = lines.filter(line => {
        // Filter out likely headers, totals, etc.
        const lowerLine = line.toLowerCase();
        return !lowerLine.includes('gesamt') &&
               !lowerLine.includes('summe') &&
               !lowerLine.includes('mwst') &&
               !lowerLine.includes('datum') &&
               !lowerLine.includes('uhrzeit') &&
               !lowerLine.includes('rechnung') &&
               !lowerLine.includes('kassenbon') &&
               !lowerLine.includes('vielen dank') &&
               !lowerLine.includes('eur');
      });
      
      await worker.terminate();
      
      onProcessingComplete(productLines);
      
      toast({
        title: "Quittung gescannt",
        description: `${productLines.length} mögliche Produkte erkannt.`,
      });
    } catch (error) {
      console.error('OCR Error:', error);
      onError(error instanceof Error ? error : new Error('Unknown OCR error'));
      
      toast({
        title: "Fehler bei der Texterkennung",
        description: "Die Quittung konnte nicht verarbeitet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  return null; // This component doesn't render anything
};

export default OcrProcessor;
