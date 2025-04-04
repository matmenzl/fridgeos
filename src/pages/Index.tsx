import React, { useState, useEffect } from 'react';
import { getAllNotes, saveNote, Note, getAllReceiptProducts, ProductNote, deleteReceiptProduct } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";
import ProductCaptureDialog from '../components/product-capture/ProductCaptureDialog';
import ReceiptScanner from '../components/receipt-scanner/ReceiptScanner';
import MenuSuggestions from '../components/MenuSuggestions';
import PageHeader from '../components/PageHeader';
import ActionButtons from '../components/ActionButtons';
import ProductList from '../components/ProductList';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [receiptProducts, setReceiptProducts] = useState<ProductNote[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
    loadReceiptProducts();
  }, []);

  const loadNotes = () => {
    console.log("Loading notes...");
    const savedNotes = getAllNotes();
    console.log("Loaded notes count:", savedNotes.length);
    setNotes(savedNotes);
  };

  const loadReceiptProducts = () => {
    console.log("Loading receipt products...");
    const savedProducts = getAllReceiptProducts();
    console.log("Loaded receipt products count:", savedProducts.length);
    setReceiptProducts(savedProducts);
  };

  const handleProductSave = (data: { text: string, metadata: any }) => {
    console.log("Saving product:", data);
    if (data.metadata.product && data.metadata.product.trim()) {
      const productName = data.metadata.product.trim();
      console.log("Saving product name:", productName);
      saveNote(productName);
      loadNotes();
      toast({
        title: "Produkt gespeichert",
        description: `"${productName}" wurde erfolgreich gespeichert.",
      });
    } else {
      console.error("No product name found in:", data);
      toast({
        title: "Fehler",
        description: "Beim Speichern des Produkts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReceiptProduct = (id: string) => {
    console.log("Deleting receipt product:", id);
    console.log("Current receipt products:", receiptProducts);
    
    // Store products before deletion
    const productsBefore = [...receiptProducts];
    
    // Delete the product
    deleteReceiptProduct(id);
    
    // Update the state by correctly filtering only the product with matching ID
    setReceiptProducts(prevProducts => {
      const newProducts = prevProducts.filter(product => product.id !== id);
      console.log(`Filtered products: Before: ${prevProducts.length}, After: ${newProducts.length}`);
      return newProducts;
    });
    
    toast({
      title: "Produkt gelöscht",
      description: "Das Produkt wurde erfolgreich gelöscht.",
    });
  };

  const updateProductLists = () => {
    console.log("Updating product lists after receipt scan");
    // This function refreshes both notes and receipt products
    loadNotes();
    loadReceiptProducts();
  };

  const handleNoteDelete = (noteId: string) => {
    console.log("Index - Note deleted, ID:", noteId);
    
    // Update the notes state by filtering out only the deleted note
    setNotes(currentNotes => {
      const filteredNotes = currentNotes.filter(note => {
        const keep = note.id !== noteId;
        console.log(`Note ${note.id} keep? ${keep} (comparing with ${noteId})`);
        return keep;
      });
      
      console.log("Notes after filtering:", filteredNotes.map(n => n.id));
      return filteredNotes;
    });
    
    toast({
      title: "Produkt gelöscht",
      description: "Das Produkt wurde erfolgreich gelöscht.",
    });
  };

  return (
    <div className="min-h-screen">
      <PageHeader />

      <div className="px-4 md:px-6">
        <ActionButtons 
          onProductDialogOpen={() => setProductDialogOpen(true)}
          onScannerDialogOpen={() => setScannerDialogOpen(true)}
        />

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Erfasste Lebensmittel</h2>
        
        <div className="mb-8">
          <ProductList 
            notes={notes}
            receiptProducts={receiptProducts}
            onNoteDelete={handleNoteDelete}
            onReceiptProductDelete={handleDeleteReceiptProduct}
          />
        </div>
        
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
