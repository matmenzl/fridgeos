
import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Scan, Camera, Loader2, X, Check } from "lucide-react";
import { saveNote } from '../services/noteStorage';

interface ReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Kamerazugriff fehlgeschlagen",
        description: "Bitte erlaube den Zugriff auf deine Kamera.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Match canvas dimensions to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image as data URL
        const imageDataUrl = canvas.toDataURL('image/png');
        setImageUrl(imageDataUrl);
        stopCamera();
        
        // Start OCR processing
        processImage(imageDataUrl);
      }
    }
  };

  const processImage = async (imageUrl: string) => {
    setScanning(true);
    setResults([]);
    
    try {
      toast({
        title: "Verarbeitung gestartet",
        description: "Bitte warte, während die Quittung gescannt wird...",
      });

      const worker = await createWorker('deu');
      
      const result = await worker.recognize(imageUrl);
      console.log('OCR Result:', result);
      
      // Process the text to extract product information
      const lines = result.data.text.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 2); // Filter out very short lines
      
      // Simple filtering to find potential product lines
      // This is a basic implementation - would need refinement for real receipts
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
      
      setResults(productLines);
      await worker.terminate();
      
      setScanning(false);
      
      toast({
        title: "Quittung gescannt",
        description: `${productLines.length} mögliche Produkte erkannt.`,
      });
    } catch (error) {
      console.error('OCR Error:', error);
      setScanning(false);
      toast({
        title: "Fehler bei der Texterkennung",
        description: "Die Quittung konnte nicht verarbeitet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  const toggleItemSelection = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleRetake = () => {
    setImageUrl(null);
    setResults([]);
    setSelectedItems([]);
    startCamera();
  };

  const saveSelectedItems = () => {
    if (selectedItems.length > 0) {
      const productsText = `Von Quittung gescannt:\n${selectedItems.join('\n')}`;
      saveNote(productsText);
      
      toast({
        title: "Produkte gespeichert",
        description: `${selectedItems.length} Produkte wurden gespeichert.`,
      });
      
      // Close dialog and reset state
      onOpenChange(false);
      setImageUrl(null);
      setResults([]);
      setSelectedItems([]);
    } else {
      toast({
        title: "Keine Produkte ausgewählt",
        description: "Bitte wähle mindestens ein Produkt aus.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setImageUrl(null);
      setResults([]);
      setSelectedItems([]);
      setScanning(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Quittung scannen</DialogTitle>
          <DialogDescription>
            Fotografiere eine Quittung, um Produkte zu erfassen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {!imageUrl ? (
            <div className="relative aspect-[3/4] bg-muted rounded-md overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <canvas 
                ref={canvasRef} 
                className="hidden" 
              />
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <Button 
                  onClick={captureImage}
                  size="lg"
                  className="rounded-full h-16 w-16"
                >
                  <Camera className="h-8 w-8" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {results.length === 0 && scanning ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    Quittung wird verarbeitet...
                  </p>
                </div>
              ) : (
                <>
                  {results.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Erkannte Produkte:</p>
                      <div className="max-h-64 overflow-y-auto bg-muted rounded-md p-2">
                        {results.map((item, index) => (
                          <div 
                            key={index}
                            onClick={() => toggleItemSelection(item)}
                            className={`flex justify-between items-center p-2 rounded-md cursor-pointer mb-1 ${
                              selectedItems.includes(item) ? 'bg-primary/20 border border-primary/50' : 'bg-background hover:bg-accent'
                            }`}
                          >
                            <span className="text-sm">{item}</span>
                            {selectedItems.includes(item) ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-md text-center">
                      <p className="text-sm text-muted-foreground">
                        Keine Produkte erkannt. Versuche es mit einem besseren Foto.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={handleRetake}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Neues Foto
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          {imageUrl && results.length > 0 && !scanning && (
            <Button 
              onClick={saveSelectedItems}
              disabled={selectedItems.length === 0}
            >
              {selectedItems.length} Produkte speichern
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptScanner;
