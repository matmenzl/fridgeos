
import React from 'react';
import ProductCaptureDialog from './product-capture/ProductCaptureDialog';
import ReceiptScanner from './receipt-scanner/ReceiptScanner';

interface DialogContainerProps {
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  scannerDialogOpen: boolean;
  setScannerDialogOpen: (open: boolean) => void;
  onProductSave: (data: { text: string, metadata: any }) => Promise<void>;
  onProductsUpdated: () => void;
}

const DialogContainer: React.FC<DialogContainerProps> = ({
  productDialogOpen,
  setProductDialogOpen,
  scannerDialogOpen,
  setScannerDialogOpen,
  onProductSave,
  onProductsUpdated
}) => {
  return (
    <>
      <ProductCaptureDialog 
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={onProductSave}
      />
      
      <ReceiptScanner
        open={scannerDialogOpen}
        onOpenChange={setScannerDialogOpen}
        onProductsUpdated={onProductsUpdated}
      />
    </>
  );
};

export default DialogContainer;
