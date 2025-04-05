
import React, { useState } from 'react';
import { Note, ProductNote, saveNote } from '../../services/noteStorage';
import { useToast } from "@/hooks/use-toast";
import ProductCaptureDialog from './ProductCaptureDialog';
import ReceiptScanner from '../receipt-scanner/ReceiptScanner';

interface ProductCaptureProps {
  onProductsUpdated: () => Promise<void>;
}

const ProductCapture: React.FC<ProductCaptureProps> = ({ onProductsUpdated }) => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleProductSave = async (data: { text: string, metadata: any }) => {
    console.log("Produkt speichern:", data);
    if (data.metadata.product && data.metadata.product.trim()) {
      const productName = data.metadata.product.trim();
      console.log("Produktname speichern:", productName);
      await saveNote(productName);
      await onProductsUpdated();
      toast({
        title: "Produkt gespeichert",
        description: `"${productName}" wurde erfolgreich gespeichert.`,
      });
    } else {
      console.error("Kein Produktname gefunden in:", data);
      toast({
        title: "Fehler",
        description: "Beim Speichern des Produkts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ProductCaptureDialog 
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={handleProductSave}
      />
      
      <ReceiptScanner
        open={scannerDialogOpen}
        onOpenChange={setScannerDialogOpen}
        onProductsUpdated={onProductsUpdated}
      />
    </>
  );
};

export default ProductCapture;
