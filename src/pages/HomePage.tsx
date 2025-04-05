
import React, { useState } from 'react';
import { useProductData } from '../hooks/useProductData';
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

import PageHeader from '../components/PageHeader';
import ActionButtons from '../components/ActionButtons';
import ProductList from '../components/ProductList';
import MenuSuggestions from '../components/MenuSuggestions';
import MigrationBanner from '../components/data/MigrationBanner';
import ProductCapture from '../components/product-capture/ProductCapture';

const HomePage: React.FC = () => {
  const { 
    notes, 
    receiptProducts, 
    isLoading, 
    hasMigrated,
    migrateDataToSupabase, 
    handleNoteDelete, 
    handleDeleteReceiptProduct,
    updateProductLists
  } = useProductData();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <PageHeader />

      <div className="px-4 md:px-6">
        {!hasMigrated && (
          <MigrationBanner onMigrate={migrateDataToSupabase} />
        )}

        <ActionButtons 
          onProductDialogOpen={() => setProductDialogOpen(true)}
          onScannerDialogOpen={() => setScannerDialogOpen(true)}
        />

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Erfasste Lebensmittel</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
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

        <ProductCapture onProductsUpdated={updateProductLists} />
      </div>
    </div>
  );
};

export default HomePage;
