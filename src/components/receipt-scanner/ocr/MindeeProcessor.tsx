
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
      // Call the Supabase Edge Function
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

      // Log debug information if available
      if (data.debug) {
        console.log('Mindee Debug-Informationen:', data.debug);
        
        // Enhanced logging for raw prediction data if available
        if (data.debug.raw_prediction) {
          console.log('Rohe Vorhersagedaten:', data.debug.raw_prediction);
        }
        
        // Log raw line items for detailed debugging
        if (data.debug.line_items_raw && data.debug.line_items_raw.length > 0) {
          console.log('Erkannte Produktlinien mit Confidence:');
          data.debug.line_items_raw.forEach((item, index) => {
            console.log(`${index + 1}. ${item.description || 'Unbekannt'} (Confidence: ${item.confidence || 'N/A'}, Preis: ${item.total_amount || 'N/A'})`);
          });
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
          const lowerProduct = product.toLowerCase();
          return (
            product.length > 2 && 
            !lowerProduct.includes('summe') &&
            !lowerProduct.includes('gesamt') &&
            !lowerProduct.includes('total') &&
            !lowerProduct.includes('mwst') &&
            !lowerProduct.includes('ust') &&
            !lowerProduct.match(/^\d+([,.]\d{2})?$/) && // Exclude price-only lines
            !lowerProduct.match(/^\d{2}[.:]\d{2}[.:]\d{4}$/) // Exclude date-only lines
          );
        });
        
        console.log('Gefilterte Produkte:', filteredProducts);
        
        if (filteredProducts.length > 0) {
          onComplete(filteredProducts);
          return;
        } else {
          console.log('Keine relevanten Produkte nach Filterung übrig, wechsle zu Tesseract');
        }
      }

      // If no products or API error, switch to Tesseract
      console.log('Keine Produkte mit Mindee erkannt oder API-Fehler:', data.mindeeError);
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
