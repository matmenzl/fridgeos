
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

      // Check if products were recognized
      if (data.products && data.products.length > 0) {
        setProgress(100);
        
        toast({
          title: "Quittung analysiert",
          description: `${data.products.length} Produkte mit Cloud-KI erkannt.`,
        });
        
        onComplete(data.products);
        return;
      }

      // If no products or API error, switch to Tesseract
      console.log('Keine Produkte mit Mindee erkannt oder API-Fehler:', data.mindeeError);
      enableFallback();
      
    } catch (error) {
      console.error('Fehler bei der Edge Function:', error);
      enableFallback();
    }
  };

  return null;
};

export default MindeeProcessor;
