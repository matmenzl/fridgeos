
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { saveNote } from '../../services/noteStorage';
import CameraCapture from './CameraCapture';
import OcrProcessor from './OcrProcessor';
import ResultsList from './ResultsList';
import LoadingState from './LoadingState';

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

  const handleCapture = (capturedImageUrl: string) => {
    setImageUrl(capturedImageUrl);
  };

  const handleProcessingStart = () => {
    setScanning(true);
    setResults([]);
  };

  const handleProcessingComplete = (productLines: string[]) => {
    setResults(productLines);
    setScanning(false);
  };

  const handleProcessingError = (error: Error) => {
    console.error('Processing error:', error);
    setScanning(false);
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
            Fotografiere eine Quittung, um Produkte zu erfassen.
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
