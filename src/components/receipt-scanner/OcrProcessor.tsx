
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from '../../integrations/supabase/client';

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
  const [progress, setProgress] = useState(0);
  const [processingError, setProcessingError] = useState<Error | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      processImage(imageUrl);
    }
  }, [imageUrl]);

  // Verarbeite das Bild, versuche zunächst Mindee und dann Fallback zu Tesseract
  const processImage = async (imageUrl: string) => {
    onProcessingStart();
    setProcessingError(null);
    setProgress(10); // Anfangsstatus
    
    try {
      // Versuche zuerst Mindee API über die Edge Function
      const mindeeResult = await processMindeeAPI(imageUrl);
      
      // Wenn Mindee Produkte gefunden hat, verwende diese
      if (mindeeResult.products && mindeeResult.products.length > 0) {
        onProcessingComplete(mindeeResult.products);
        return;
      }
      
      // Wenn Mindee keine Produkte gefunden hat oder ein Fehler auftrat, zu Tesseract wechseln
      console.log('Keine Produkte mit Mindee erkannt oder API-Fehler:', mindeeResult.mindeeError);
      setUseFallback(true);
      toast({
        title: "Fallback auf lokale Texterkennung",
        description: "Die Cloud-KI konnte keine Produkte erkennen oder ist nicht verfügbar. Verwende lokale Texterkennung...",
      });
      
      await processImageWithTesseract(imageUrl);
      
    } catch (error) {
      console.error('Fehler bei der Bildverarbeitung:', error);
      setProcessingError(error instanceof Error ? error : new Error('Unbekannter Fehler'));
      onError(error instanceof Error ? error : new Error('Unbekannter Fehler'));
    }
  };

  // Verarbeite das Bild mit der Mindee API über Supabase Edge Function
  const processMindeeAPI = async (imageUrl: string) => {
    setProgress(20);
    
    toast({
      title: "Verarbeitung gestartet",
      description: "Quittung wird mit Cloud-KI analysiert...",
    });

    setProgress(40);

    try {
      // Rufe die Supabase Edge Function auf
      const { data, error } = await supabase.functions.invoke('receipt-parser', {
        body: { image: imageUrl }
      });

      setProgress(60);

      if (error) {
        console.error('Supabase Edge Function Fehler:', error);
        throw new Error(`Fehler bei der Verarbeitung: ${error.message}`);
      }

      if (!data.success) {
        console.error('API Fehler:', data.error);
        throw new Error(data.error || 'Unbekannter Fehler bei der Verarbeitung');
      }

      setProgress(80);

      // Überprüfen, ob Produkte erkannt wurden
      if (data.products && data.products.length > 0) {
        setProgress(100);
        
        toast({
          title: "Quittung analysiert",
          description: `${data.products.length} Produkte mit Cloud-KI erkannt.`,
        });
      }

      return data;
    } catch (error) {
      console.error('Fehler bei der Edge Function:', error);
      throw error;
    }
  };

  // Fallback-Methode mit Tesseract.js
  const processImageWithTesseract = async (imageUrl: string) => {
    try {
      setProgress(10);
      toast({
        title: "Lokale Texterkennung gestartet",
        description: "Quittung wird lokal mit Tesseract gescannt...",
      });

      // Dynamisches Importieren von Tesseract.js bei Bedarf
      const { createWorker, PSM } = await import('tesseract.js');
      
      // Überprüfe, ob das Bild gültig ist
      if (!imageUrl.startsWith('data:image')) {
        throw new Error('Ungültiges Bildformat. Bitte versuche es erneut mit einem anderen Bild.');
      }

      setProgress(30);

      // Initialize Tesseract worker with optimized options for German receipts
      const worker = await createWorker({
        logger: m => {
          console.log(m);
          if (m.progress !== undefined) {
            // Tesseract Progress auf 30-90% mappen
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
      
      // Process the text to extract product information with improved filtering
      const productLines = filterProductLines(result.data.text);
      
      await worker.terminate();
      
      setProgress(100);
      
      onProcessingComplete(productLines);
      
      toast({
        title: "Quittung gescannt",
        description: `${productLines.length} mögliche Produkte mit lokaler Texterkennung identifiziert.`,
      });
    } catch (error) {
      console.error('Tesseract OCR Error:', error);
      const finalError = error instanceof Error ? error : new Error('Unknown OCR error');
      setProcessingError(finalError);
      onError(finalError);
      
      toast({
        title: "Fehler bei der Texterkennung",
        description: "Die Quittung konnte nicht verarbeitet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  // Optimize text extraction for German receipts
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

  const dismissError = () => {
    setProcessingError(null);
    // Hier können wir auch wieder zurück zur Kameraansicht navigieren
    onError(new Error('Processing cancelled by user'));
  };

  return (
    <>
      {progress > 0 && progress < 100 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2 text-center">
            Verarbeitung: {progress}%
            {useFallback && " (Tesseract Fallback)"}
          </p>
          <Progress value={progress} className="w-full h-2" />
        </div>
      )}
      
      <AlertDialog open={!!processingError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fehler bei der Verarbeitung</AlertDialogTitle>
            <AlertDialogDescription>
              {processingError?.message || 'Es ist ein unbekannter Fehler aufgetreten.'}
              <p className="mt-2">
                Bitte versuche es mit einem klareren Bild oder überprüfe das Bildformat.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={dismissError} className="mt-4">
            Verstanden
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OcrProcessor;
