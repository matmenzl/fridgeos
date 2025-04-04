
import React, { useState, useEffect } from 'react';
import { getAllNotes, saveNote, Note, getAllReceiptProducts, ProductNote, deleteReceiptProduct, deleteNote, migrateLocalDataToSupabase } from '../services/noteStorage';
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initial data loading and migration
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        // Versuche, lokale Daten zu migrieren
        await migrateLocalDataToSupabase();
        
        // Jetzt die Daten aus Supabase laden
        await loadNotes();
        await loadReceiptProducts();
        
        toast({
          title: "Erfolgreich geladen",
          description: "Deine Produkte wurden geladen.",
        });
      } catch (error) {
        console.error('Fehler beim Initialisieren der Daten:', error);
        toast({
          title: "Fehler",
          description: "Die Daten konnten nicht geladen werden.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [toast]);

  const loadNotes = async () => {
    console.log("Loading notes...");
    try {
      const savedNotes = await getAllNotes();
      console.log("Loaded notes count:", savedNotes.length);
      setNotes(savedNotes);
      return savedNotes;
    } catch (error) {
      console.error('Fehler beim Laden der Notizen:', error);
      throw error;
    }
  };

  const loadReceiptProducts = async () => {
    console.log("Loading receipt products...");
    try {
      const savedProducts = await getAllReceiptProducts();
      console.log("Loaded receipt products count:", savedProducts.length);
      setReceiptProducts(savedProducts);
      return savedProducts;
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error);
      throw error;
    }
  };

  const handleProductSave = async (data: { text: string, metadata: any }) => {
    console.log("Saving product:", data);
    if (data.metadata.product && data.metadata.product.trim()) {
      const productName = data.metadata.product.trim();
      console.log("Saving product name:", productName);
      
      try {
        await saveNote(productName);
        await loadNotes();
        toast({
          title: "Produkt gespeichert",
          description: `"${productName}" wurde erfolgreich gespeichert.`,
        });
      } catch (error) {
        console.error("Fehler beim Speichern:", error);
        toast({
          title: "Fehler",
          description: "Beim Speichern des Produkts ist ein Fehler aufgetreten.",
          variant: "destructive",
        });
      }
    } else {
      console.error("No product name found in:", data);
      toast({
        title: "Fehler",
        description: "Beim Speichern des Produkts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteReceiptProduct = async (id: string) => {
    console.log("Deleting receipt product:", id);
    try {
      const success = await deleteReceiptProduct(id);
      if (success) {
        // Update the state directly after deletion
        setReceiptProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        toast({
          title: "Produkt gelöscht",
          description: "Das Produkt wurde erfolgreich gelöscht.",
        });
      } else {
        throw new Error('Produkt konnte nicht gelöscht werden');
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Produkts:', error);
      toast({
        title: "Fehler",
        description: "Das Produkt konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const updateProductLists = async () => {
    console.log("Updating product lists after receipt scan");
    try {
      setIsLoading(true);
      // This function refreshes both notes and receipt products
      await loadNotes();
      await loadReceiptProducts();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Produkte:', error);
      toast({
        title: "Fehler",
        description: "Die Produkte konnten nicht aktualisiert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteDelete = async (noteId: string) => {
    console.log("Index - Note deleted, ID:", noteId);
    
    try {
      const success = await deleteNote(noteId);
      if (success) {
        // Update the notes state by filtering out the deleted note
        setNotes(currentNotes => {
          const filteredNotes = currentNotes.filter(note => note.id !== noteId);
          console.log("Notes after filtering:", filteredNotes.map(n => n.id));
          return filteredNotes;
        });
        
        toast({
          title: "Produkt gelöscht",
          description: "Das Produkt wurde erfolgreich gelöscht.",
        });
      } else {
        throw new Error('Notiz konnte nicht gelöscht werden');
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
      toast({
        title: "Fehler",
        description: "Das Produkt konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
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
            isLoading={isLoading}
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
