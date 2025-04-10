
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { saveReceiptProduct } from '../../services/noteStorage';
import CameraCapture from './CameraCapture';
import OcrProcessor from './OcrProcessor';
import ResultsList from './ResultsList';
import LoadingState from './LoadingState';
import { cleanProductName } from '../../utils/productNameCleaner';

interface ReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsUpdated?: () => void; // Callback prop for product updates
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  open,
  onOpenChange,
  onProductsUpdated
}) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleCapture = (capturedImageUrl: string) => {
    setImageUrl(capturedImageUrl);
  };

  const handleProcessingStart = () => {
    setScanning(true);
    setResults([]);
  };

  const handleProcessingComplete = (productLines: string[]) => {
    // Clean product names before displaying
    const cleanedProductLines = productLines.map(line => cleanProductName(line));
    setResults(cleanedProductLines);
    setScanning(false);
  };

  const handleProcessingError = (error: Error) => {
    console.error('Processing error:', error);
    setScanning(false);
    
    // Wenn der Nutzer den Prozess abbricht (über den Dialog), zeigen wir keine weitere Fehlermeldung
    if (error.message === 'Processing cancelled by user') {
      return;
    }
    
    // Wenn wir einen Bildverarbeitungsfehler haben, zurück zur Kamera gehen
    setImageUrl(null);
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
  };

  const saveSelectedItems = async () => {
    if (selectedItems.length > 0) {
      // Jedes ausgewählte Produkt einzeln speichern - make sure they're cleaned
      selectedItems.forEach(item => {
        const cleanedItem = cleanProductName(item);
        saveReceiptProduct(cleanedItem);
      });
      
      toast({
        title: "Produkte gespeichert",
        description: `${selectedItems.length} Produkte wurden gespeichert.`,
      });
      
      // Notify parent component that products have been updated
      if (onProductsUpdated) {
        onProductsUpdated();
      }
      
      // Dialog schließen und Status zurücksetzen
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

  const handleRemoveItem = (itemToRemove: string) => {
    setResults(results.filter(item => item !== itemToRemove));
    if (selectedItems.includes(itemToRemove)) {
      setSelectedItems(selectedItems.filter(item => item !== itemToRemove));
    }
  };

  React.useEffect(() => {
    if (!open) {
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
            Fotografiere eine Quittung oder lade ein Bild hoch, um Produkte zu erfassen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {!imageUrl ? (
            <CameraCapture onCapture={handleCapture} />
          ) : (
            <div className="space-y-4">
              {results.length === 0 && scanning ? (
                <LoadingState />
              ) : (
                <>
                  <ResultsList 
                    results={results} 
                    selectedItems={selectedItems} 
                    onToggleSelection={toggleItemSelection} 
                    onRemoveItem={handleRemoveItem}
                  />
                  
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
        
        {imageUrl && results.length > 0 && !scanning && (
          <DialogFooter>
            <Button 
              onClick={saveSelectedItems}
              disabled={selectedItems.length === 0}
            >
              {selectedItems.length} Produkte speichern
            </Button>
          </DialogFooter>
        )}

        {imageUrl && <OcrProcessor
          imageUrl={imageUrl}
          onProcessingStart={handleProcessingStart}
          onProcessingComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptScanner;
