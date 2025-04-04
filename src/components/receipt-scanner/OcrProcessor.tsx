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

  const filterProductLines = (text: string): string[] => {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2);
    
    console.log('Raw OCR lines:', lines);
    
    const productLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
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
      
      const isPriceLine = /^\s*\d+[.,]\d{2}\s*€?\s*$/.test(line);
      
      const isNumberOnly = /^\s*\d+\s*$/.test(line);
      
      const hasPrice = /\d+[.,]\d{2}/.test(line);
      
      const hasLettersAndDigits = /[A-Za-zäöüÄÖÜß].*\d|\d.*[A-Za-zäöüÄÖÜß]/.test(line);
      
      const hasReasonableLength = line.length > 3 && line.length < 60;
      
      const isTooShortWord = lowerLine.split(/\s+/).some(word => word.length < 3 && word.length > 0);
      
      const isReceiptPattern = /^\s*[-x*]\s+\d+/.test(line) || 
                              /^\s*\d+\s*x\s+/.test(line);
      
      return !isMetadata && !isPriceLine && !isNumberOnly && hasReasonableLength && 
             (hasLettersAndDigits || !hasPrice) && !isReceiptPattern;
    });
    
    const uniqueProducts = [...new Set(productLines)]
      .map(line => {
        return line.replace(/\s+\d+[.,]\d{2}\s*€?\s*$/, '')
                   .replace(/^\s*\d+\s*[xX]\s*/, '')
                   .replace(/\s{2,}/g, ' ')
                   .trim();
      })
      .filter(line => line.length > 3);
    
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

      const worker = await createWorker({
        logger: m => console.log(m),
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
      });
      
      await worker.loadLanguage('deu+eng');
      
      await worker.initialize('deu+eng');
      
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß0123456789.,€%:;+-/ *',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: PSM.AUTO,
        tessjs_create_hocr: '0',
        tessjs_create_tsv: '0',
        language_model_penalty_non_dict_word: '0.5',
        language_model_penalty_case: '0.1',
      });
      
      const canvas = document.createElement('canvas');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      const targetWidth = Math.max(1500, img.width);
      const scaleFactor = targetWidth / img.width;
      canvas.width = targetWidth;
      canvas.height = img.height * scaleFactor;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const threshold = 160;
          const newValue = avg < threshold ? 0 : 255;
          data[i] = data[i + 1] = data[i + 2] = newValue;
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      const enhancedImageUrl = canvas.toDataURL('image/png');
      
      const result = await worker.recognize(enhancedImageUrl);
      console.log('OCR Result:', result);
      
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

  return null;
};

export default OcrProcessor;
