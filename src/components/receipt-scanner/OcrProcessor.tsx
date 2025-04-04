
import React from 'react';
import { createWorker, PSM, createScheduler } from 'tesseract.js';
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

  // Bildvorverarbeitung für bessere OCR-Ergebnisse
  const preprocessImage = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Originalbild zeichnen
        ctx.drawImage(img, 0, 0);
        
        // Bild in Graustufen umwandeln
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          // Kontrast erhöhen
          const contrastedValue = (avg - 128) * 1.5 + 128;
          
          // Thresholding anwenden
          const thresholdValue = contrastedValue > 150 ? 255 : 0;
          
          data[i] = thresholdValue;     // R
          data[i + 1] = thresholdValue; // G
          data[i + 2] = thresholdValue; // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  // Verbesserte Line-Klassifizierung für deutsche Quittungen
  const isProductLine = (line: string): boolean => {
    const lowerLine = line.toLowerCase();
    
    // Exakte Muster für Nicht-Produkte
    const nonProductPatterns = [
      /^summe\s*:?\s*\d+[.,]\d{2}\s*€?$/i,
      /^gesamt\s*:?\s*\d+[.,]\d{2}\s*€?$/i,
      /^zwischensumme\s*:?\s*\d+[.,]\d{2}\s*€?$/i,
      /^mwst\s*\d+%\s*:?\s*\d+[.,]\d{2}\s*€?$/i,
      /^ust\s*\d+%\s*:?\s*\d+[.,]\d{2}\s*€?$/i,
      /^bar\s*:?\s*\d+[.,]\d{2}\s*€?$/i,
      /^rückgeld\s*:?\s*\d+[.,]\d{2}\s*€?$/i,
      /^datum\s*:?\s*\d{1,2}[./-]\d{1,2}[./-]\d{2,4}/i,
      /^uhrzeit\s*:?\s*\d{1,2}:\d{2}/i,
      /^bonnr\s*:?\s*\d+/i,
      /^tel\s*:?\s*[\d\s/+-]+$/i,
      /^rabatt/i,
      /^kassenbon/i,
      /^quittung/i,
      /^beleg/i,
      /^pfand/i,
      /^artikelanzahl/i,
      /^steuer/i,
      /^netto/i,
      /^brutto/i,
      /^ec\s*-?\s*karte/i,
      /^kreditkarte/i,
      /^kartenzahlung/i,
      /^kunden\s*-?\s*nr/i,
      /^danke/i,
      /^auf\s*wiedersehen/i,
      /^öffnungszeiten/i,
      /^www\./i,
      /^http/i,
      /^e-mail/i,
      /^filiale/i,
      /^markt/i
    ];
    
    // Testen auf Nicht-Produkt-Muster
    for (const pattern of nonProductPatterns) {
      if (pattern.test(lowerLine)) {
        return false;
      }
    }
    
    // Produkt-Erkennungsmuster
    const productPatterns = [
      // Typische Produkt-Preis-Muster: "Produkt 1,99€" oder "Produkt 1.99"
      /[a-zäöüß]+.*\d+[.,]\d{2}\s*€?/i,
      // Produkt mit Menge: "2x Milch 3,98"
      /\d+\s*x\s*[a-zäöüß]+.*\d+[.,]\d{2}/i,
      // Produkt mit Gewicht: "Käse 0,253kg 3,98"
      /[a-zäöüß]+.*\d+[.,]\d{2,3}\s*kg.*\d+[.,]\d{2}/i
    ];
    
    // Mind. ein Produktmuster und eine vernünftige Länge
    for (const pattern of productPatterns) {
      if (pattern.test(line) && line.length > 3 && line.length < 60) {
        return true;
      }
    }
    
    // Heuristiken für Produktzeilen, die keine typischen Muster aufweisen
    const hasLettersAndDigits = /[A-Za-zÄÖÜäöüß].*\d|\d.*[A-Za-zÄÖÜäöüß]/.test(line);
    const hasPricePattern = /\d+[.,]\d{2}/.test(line);
    const hasReasonableLength = line.length > 3 && line.length < 60;
    const hasNoMetadataWords = !/(?:gesamtbetrag|bargeldbetrag|kartenbetrag|rechnung)/i.test(lowerLine);
    
    return hasReasonableLength && hasLettersAndDigits && hasPricePattern && hasNoMetadataWords;
  };

  // Optimierte Produktzeilenextraktion mit NLP-Ansatz
  const filterProductLines = (text: string): string[] => {
    // Zeilen aufteilen und bereinigen
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);
    
    console.log('Raw OCR lines:', lines);
    
    // Produktzeilen mit dem verbesserten Klassifikator filtern
    const productLines = lines.filter(isProductLine);
    
    console.log('Filtered product lines:', productLines);
    return productLines;
  };

  const processImage = async (imageUrl: string) => {
    onProcessingStart();
    
    try {
      toast({
        title: "Verarbeitung gestartet",
        description: "Bitte warte, während die Quittung gescannt wird...",
      });

      // Bild vorverarbeiten für bessere OCR-Ergebnisse
      console.log("Preprocessing image...");
      const preprocessedImageUrl = await preprocessImage(imageUrl);
      console.log("Preprocessing complete");

      // Tesseract Worker mit optimierten Optionen initialisieren
      const worker = await createWorker({
        logger: m => console.log(m),
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      });
      
      // Deutsche Sprachdaten laden
      await worker.loadLanguage('deu');
      
      // Tesseract für optimierte Quittungserkennung konfigurieren
      await worker.initialize('deu');
      
      // Tesseract-Parameter für bessere Quittungserkennung setzen
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß0123456789.,€%:;+-/ ',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      });
      
      // OCR auf dem vorverarbeiteten Bild ausführen
      const result = await worker.recognize(preprocessedImageUrl);
      console.log('OCR Result:', result);
      
      // Text verarbeiten, um Produktinformationen mit verbessertem Filtering zu extrahieren
      const productLines = filterProductLines(result.data.text);
      
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

  return null; // Diese Komponente rendert nichts
};

export default OcrProcessor;
