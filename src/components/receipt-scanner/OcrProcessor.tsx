
import React from 'react';
import { createWorker, PSM } from 'tesseract.js';
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

  // Verbesserte Funktion zur Erkennung von Produktnamen
  const filterProductLines = (text: string): string[] => {
    // Text in Zeilen aufteilen und bereinigen
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);
    
    console.log('Raw OCR lines:', lines);
    
    // Optimierte Filterung für deutsche Kassenbons
    const productLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Häufige Metadaten in deutschen Kassenbons ausschließen
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
      
      // Nur-Preis-Zeilen ausfiltern (häufig in deutschen Kassenbons)
      const isPriceLine = /^\s*\d+[.,]\d{2}\s*€?\s*$/.test(line);
      
      // Nummerierte Zeilen ohne Produktnamen ausfiltern
      const isNumberOnly = /^\s*\d+\s*$/.test(line);
      
      // Potenzielle Produktzeilen haben oft einen Preis
      const hasPrice = /\d+[.,]\d{2}/.test(line);
      
      // Produktzeilen haben typischerweise einen Mix aus Buchstaben und Zahlen
      const hasLettersAndDigits = /[A-Za-zäöüÄÖÜß].*\d|\d.*[A-Za-zäöüÄÖÜß]/.test(line);
      
      // Typische Länge von Produktbeschreibungen
      const hasReasonableLength = line.length > 3 && line.length < 60;
      
      // Kurze Wörter wie Artikelüberschriften ausschließen
      const isTooShortWord = lowerLine.split(/\s+/).some(word => word.length < 3 && word.length > 0);
      
      // Zeilen mit bestimmten Mustern von Kassenbons entfernen
      const isReceiptPattern = /^\s*[-x*]\s+\d+/.test(line) || // Muster wie "- 1" am Anfang
                              /^\s*\d+\s*x\s+/.test(line);    // Muster wie "2 x" am Anfang

      return !isMetadata && !isPriceLine && !isNumberOnly && hasReasonableLength && 
             (hasLettersAndDigits || !hasPrice) && !isReceiptPattern;
    });
    
    // Duplikate entfernen und Ergebnisse bereinigen
    const uniqueProducts = [...new Set(productLines)]
      .map(line => {
        // Preisinformationen entfernen (oft am Ende der Zeile)
        return line.replace(/\s+\d+[.,]\d{2}\s*€?\s*$/, '')
                   // Mengenangaben am Anfang entfernen
                   .replace(/^\s*\d+\s*[xX]\s*/, '')
                   // Zusätzliche Leerzeichen reduzieren
                   .replace(/\s{2,}/g, ' ')
                   .trim();
      })
      .filter(line => line.length > 3); // Zu kurze Linien nach Bereinigung entfernen
    
    console.log('Filtered product lines:', uniqueProducts);
    return uniqueProducts;
  };

  const processImage = async (imageUrl: string) => {
    onProcessingStart();
    
    try {
      toast({
        title: "Verarbeitung gestartet",
        description: "Bitte warte, während die Quittung gescannt wird...",
      });

      // Tesseract Worker mit optimierten Einstellungen für deutsche Kassenbons initialisieren
      const worker = await createWorker({
        logger: m => console.log(m),
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      });
      
      // Deutsche Sprachdaten laden - zusätzlich auch Englisch für gemischte Texte
      await worker.loadLanguage('deu+eng');
      
      // Tesseract für optimierte Kassenbon-Erkennung konfigurieren
      await worker.initialize('deu+eng');
      
      // Tesseract-Parameter für bessere Texterkennung setzen
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß0123456789.,€%:;+-/ *',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: PSM.AUTO, // Automatische Segmentierung für unterschiedliche Textblöcke
        tessedit_ocr_engine_mode: 3, // LSTM-Engine für bessere Genauigkeit
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        textord_force_make_prop_words: '0',
        textord_tablefind_recognize_tables: '0',
        tessedit_do_invert: '0',
        // Zusätzliche Parameter für die Verbesserung der Erkennung kleingeschriebener Texte
        language_model_penalty_non_dict_word: '0.5',
        language_model_penalty_case: '0.1', // Geringere Bestrafung für Großbuchstaben vs. Kleinbuchstaben
        textord_min_linesize: '2.5',
      });
      
      // Bild vorverarbeiten - größere Breite für bessere Erkennung
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      // Größe für bessere OCR anpassen (größer machen falls zu klein)
      const targetWidth = Math.max(1024, img.width);
      const scaleFactor = targetWidth / img.width;
      canvas.width = targetWidth;
      canvas.height = img.height * scaleFactor;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Bildoptimierung für bessere OCR-Erkennung
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Kontrast erhöhen für bessere Erkennung kleingeschriebenen Textes
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Schwarz-Weiß-Konvertierung mit angepasstem Schwellwert für Textkontrast
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const threshold = 180; // Höherer Schwellwert für besseren Textkontrast
          const newValue = avg < threshold ? 0 : 255;
          
          data[i] = data[i + 1] = data[i + 2] = newValue;
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      const enhancedImageUrl = canvas.toDataURL('image/png');
      
      // OCR mit optimiertem Bild durchführen
      const result = await worker.recognize(enhancedImageUrl);
      console.log('OCR Result:', result);
      
      // Text verarbeiten, um Produktinformationen mit verbesserter Filterung zu extrahieren
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
