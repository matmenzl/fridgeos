
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { saveReceiptProduct } from '../../services/noteStorage';
import OcrProcessor from './OcrProcessor';
import CaptureView from './CaptureView';
import ReceiptDialog from './ReceiptDialog';
import SaveButton from './SaveButton';
import { cleanProductName } from '../../utils/productNameCleaner';

interface ReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductsUpdated?: () => void;
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
      console.log("Saving selected receipt items:", selectedItems.length);
      
      try {
        // Save all selected products with current timestamp
        const currentTimestamp = Date.now();
        const savePromises = selectedItems.map(item => {
          const cleanedItem = cleanProductName(item);
          console.log("Saving receipt product with timestamp:", currentTimestamp, cleanedItem);
          return saveReceiptProduct(cleanedItem);
        });
        
        // Wait for all products to be saved
        await Promise.all(savePromises);
        
        toast({
          title: "Produkte gespeichert",
          description: `${selectedItems.length} Produkte wurden gespeichert.`,
        });
        
        // Reset state and close dialog
        onOpenChange(false);
        setImageUrl(null);
        setResults([]);
        setSelectedItems([]);
        
        // Notify parent component that products have been updated
        if (onProductsUpdated) {
          console.log("Calling onProductsUpdated after saving receipt products");
          onProductsUpdated();
        }
      } catch (error) {
        console.error("Error saving receipt products:", error);
        toast({
          title: "Fehler beim Speichern",
          description: "Es ist ein Fehler beim Speichern der Produkte aufgetreten.",
          variant: "destructive",
        });
      }
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

  useEffect(() => {
    if (!open) {
      setImageUrl(null);
      setResults([]);
      setSelectedItems([]);
      setScanning(false);
    }
  }, [open]);

  // Prepare the footer content for the dialog
  const footerContent = imageUrl && results.length > 0 && !scanning ? (
    <SaveButton 
      selectedItemsCount={selectedItems.length} 
      onSave={saveSelectedItems} 
    />
  ) : null;

  return (
    <ReceiptDialog 
      open={open} 
      onOpenChange={onOpenChange}
      footerContent={footerContent}
    >
      <CaptureView 
        imageUrl={imageUrl}
        scanning={scanning}
        results={results}
        selectedItems={selectedItems}
        onCapture={handleCapture}
        onToggleSelection={toggleItemSelection}
        onRemoveItem={handleRemoveItem}
        onRetake={handleRetake}
      />

      {imageUrl && (
        <OcrProcessor
          imageUrl={imageUrl}
          onProcessingStart={handleProcessingStart}
          onProcessingComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />
      )}
    </ReceiptDialog>
  );
};

export default ReceiptScanner;
