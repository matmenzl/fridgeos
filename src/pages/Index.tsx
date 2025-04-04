
import React, { useState } from 'react';
import { deleteReceiptProduct } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";
import ProductCaptureDialog from '../components/product-capture/ProductCaptureDialog';
import ReceiptScanner from '../components/receipt-scanner/ReceiptScanner';
import MenuSuggestions from '../components/MenuSuggestions';
import PageHeader from '../components/PageHeader';
import ActionButtons from '../components/ActionButtons';
import ProductList from '../components/ProductList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DataMigrationBanner from '../components/data/DataMigrationBanner';
import { useProductData } from '../hooks/useProductData';

const Index = () => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(localStorage.getItem('dataMigratedToSupabase') === 'true');
  const { toast } = useToast();
  
  const { 
    notes, 
    receiptProducts, 
    isLoading, 
    updateProductLists, 
    handleNoteDelete, 
    handleReceiptProductDelete,
    handleProductSave 
  } = useProductData();

  const handleDeleteReceiptProduct = async (id: string) => {
    // Produkt aus der Datenbank löschen
    await deleteReceiptProduct(id);
    
    // State aktualisieren
    handleReceiptProductDelete(id);
    
    toast({
      title: "Produkt gelöscht",
      description: "Das Produkt wurde erfolgreich gelöscht.",
    });
  };

  return (
    <div className="min-h-screen">
      <PageHeader />

      <div className="px-4 md:px-6">
        <DataMigrationBanner 
          hasMigrated={hasMigrated} 
          onMigrationComplete={() => setHasMigrated(true)} 
        />

        <ActionButtons 
          onProductDialogOpen={() => setProductDialogOpen(true)}
          onScannerDialogOpen={() => setScannerDialogOpen(true)}
        />

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Erfasste Lebensmittel</h2>
        
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="mb-8">
            <ProductList 
              notes={notes}
              receiptProducts={receiptProducts}
              onNoteDelete={handleNoteDelete}
              onReceiptProductDelete={handleDeleteReceiptProduct}
              onProductUpdate={updateProductLists}
            />
          </div>
        )}
        
        <MenuSuggestions notes={notes} receiptProducts={receiptProducts} />

        <ProductCaptureDialog 
          open={productDialogOpen}
          onOpenChange={setProductDialogOpen}
          onSave={handleProductSave}
        />
        
        <ReceiptScanner
          open={scannerDialogOpen}
          onOpenChange={setScannerDialogOpen}
          onProductsUpdated={updateProductLists}
        />
      </div>
    </div>
  );
};

export default Index;
