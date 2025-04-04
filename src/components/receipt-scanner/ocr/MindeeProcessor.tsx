
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '../../../integrations/supabase/client';

interface MindeeProcessorProps {
  imageUrl: string;
  setProgress: (progress: number) => void;
  onComplete: (products: string[]) => void;
  onError: (error: Error) => void;
  enableFallback: () => void;
}

const MindeeProcessor: React.FC<MindeeProcessorProps> = ({
  imageUrl,
  setProgress,
  onComplete,
  onError,
  enableFallback
}) => {
  const { toast } = useToast();

  React.useEffect(() => {
    processMindeeAPI(imageUrl);
  }, [imageUrl]);

  // Process the image with the Mindee API via Edge Function
  const processMindeeAPI = async (imageUrl: string) => {
    setProgress(20);
    
    toast({
      title: "Verarbeitung gestartet",
      description: "Quittung wird mit Cloud-KI analysiert...",
    });

    setProgress(40);

    try {
      // Call the Supabase Edge Function with proper headers
      const { data, error } = await supabase.functions.invoke('receipt-parser', {
        body: { image: imageUrl },
        headers: {
          'Content-Type': 'application/json'
        }
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

      // Enhanced debug logging with more structure
      if (data.debug) {
        console.log('Mindee Debug-Informationen:', data.debug);
        
        // Log receipt information if available
        if (data.debug.supplier_name) {
          console.log('Lieferant:', data.debug.supplier_name);
        }
        
        if (data.debug.receipt_date) {
          console.log('Datum:', data.debug.receipt_date);
        }
        
        if (data.debug.total_amount) {
          console.log('Gesamtbetrag:', data.debug.total_amount);
        }
        
        // Log raw line items with complete details for debugging
        if (data.debug.line_items_raw && data.debug.line_items_raw.length > 0) {
          console.log('Erkannte Produktlinien mit Confidence:');
          data.debug.line_items_raw.forEach((item, index) => {
            const description = item.description ? 
              (typeof item.description === 'object' ? item.description.value : item.description) : 
              'Unbekannt';
              
            const confidence = item.description && typeof item.description === 'object' ? 
              item.description.confidence : 'N/A';
              
            const price = item.total_amount ? 
              (typeof item.total_amount === 'object' ? item.total_amount.value : item.total_amount) : 
              'N/A';
              
            console.log(`${index + 1}. ${description} (Confidence: ${confidence}, Preis: ${price})`);
          });
        }
        
        // Log raw text if available
        if (data.debug.ocr_text) {
          console.log('OCR Text (Auszug):', data.debug.ocr_text.substring(0, 200) + '...');
        }
      }

      // Log the mindee error if there is one
      if (data.mindeeError) {
        console.log('Mindee Verarbeitungsfehler:', data.mindeeError);
      }

      // Enhanced check for products
      if (data.products && data.products.length > 0) {
        setProgress(100);
        
        toast({
          title: "Quittung analysiert",
          description: `${data.products.length} Produkte mit Cloud-KI erkannt.`,
        });
        
        // Filter out obvious non-product lines
        const filteredProducts = data.products.filter(product => {
          // Wenn es bereits ein String ist, behalte die ursprüngliche Filterlogik
          if (typeof product === 'string') {
            const lowerProduct = product.toLowerCase();
            return (
              product.length > 2 && 
              !lowerProduct.includes('summe') &&
              !lowerProduct.includes('gesamt') &&
              !lowerProduct.includes('total') &&
              !lowerProduct.includes('mwst') &&
              !lowerProduct.includes('ust') &&
              !lowerProduct.includes('rechnung') &&
              !lowerProduct.includes('beleg') &&
              !lowerProduct.includes('quittung') &&
              !lowerProduct.match(/^\d+([,.]\d{2})?$/) && // Exclude price-only lines
              !lowerProduct.match(/^\d{2}[.:]\d{2}[.:]\d{4}$/) // Exclude date-only lines
            );
          }
          // Wenn es ein Objekt ist, behalte es einfach
          return true;
        });
        
        console.log('Gefilterte Produkte:', filteredProducts);
        
        if (filteredProducts.length > 0) {
          onComplete(filteredProducts);
          return;
        } else {
          console.log('Keine relevanten Produkte nach Filterung übrig, wechsle zu Tesseract');
        }
      }
      
      // Wenn wir bis hierher kommen, wurden keine Produkte gefunden oder alle gefiltert
      console.log('Keine Produkte mit Mindee erkannt oder keine verwertbaren Daten gefunden');
      toast({
        title: "Cloud-Verarbeitung fehlgeschlagen",
        description: "Mindee konnte keine Produkte in der Quittung finden. Wechsle zu lokaler Verarbeitung...",
        variant: "destructive",
      });
      enableFallback();
      
    } catch (error) {
      console.error('Fehler bei der Edge Function:', error);
      toast({
        title: "Fehler bei Cloud-Verarbeitung",
        description: "Wechsle zu lokaler Verarbeitung...",
      });
      enableFallback();
    }
  };

  return null;
};

export default MindeeProcessor;
