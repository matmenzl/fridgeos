
import React, { useState, useEffect } from 'react';
import { Note, ProductNote, deleteReceiptProduct, getAllNotes, getAllReceiptProducts, saveNote, migrateNotesToSupabase, migrateReceiptProductsToSupabase } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import PageHeader from '../components/PageHeader';
import ActionButtons from '../components/ActionButtons';
import MigrationNotification from '../components/MigrationNotification';
import ProductsContent from '../components/ProductsContent';
import DialogContainer from '../components/DialogContainer';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [receiptProducts, setReceiptProducts] = useState<ProductNote[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState<boolean>(localStorage.getItem('dataMigratedToSupabase') === 'true');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log("Daten aus Supabase laden...");
      const notesData = await getAllNotes();
      const productsData = await getAllReceiptProducts();
      
      console.log("Geladene Notizen:", notesData.length);
      console.log("Geladene Produkte:", productsData.length);
      
      setNotes(notesData);
      setReceiptProducts(productsData);
    } catch (error) {
      console.error("Fehler beim Laden der Daten:", error);
      toast({
        title: "Fehler beim Laden",
        description: "Daten konnten nicht geladen werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const migrateDataToSupabase = async () => {
    try {
      toast({
        title: "Migration gestartet",
        description: "Deine Daten werden von localStorage zu Supabase migriert...",
      });
      
      const notesMigrated = await migrateNotesToSupabase();
      const productsMigrated = await migrateReceiptProductsToSupabase();
      
      if (notesMigrated && productsMigrated) {
        localStorage.setItem('dataMigratedToSupabase', 'true');
        setHasMigrated(true);
        
        // Daten neu laden
        await loadData();
        
        toast({
          title: "Migration erfolgreich",
          description: "Deine Daten wurden erfolgreich zu Supabase migriert.",
        });
      } else {
        toast({
          title: "Migration teilweise fehlgeschlagen",
          description: "Einige Daten konnten nicht migriert werden. Bitte versuche es später erneut.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler bei der Migration:", error);
      toast({
        title: "Migration fehlgeschlagen",
        description: "Bei der Migration ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    }
  };

  const handleProductSave = async (data: { text: string, metadata: any }) => {
    console.log("Produkt speichern:", data);
    if (data.metadata.product && data.metadata.product.trim()) {
      const productName = data.metadata.product.trim();
      console.log("Produktname speichern:", productName);
      await saveNote(productName);
      await loadNotes();
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

  const loadNotes = async () => {
    console.log("Notizen laden...");
    const savedNotes = await getAllNotes();
    console.log("Geladene Notizen:", savedNotes.length);
    setNotes(savedNotes);
  };

  const loadReceiptProducts = async () => {
    console.log("Kassenbeleg-Produkte laden...");
    const savedProducts = await getAllReceiptProducts();
    console.log("Geladene Kassenbeleg-Produkte:", savedProducts.length);
    setReceiptProducts(savedProducts);
  };

  const handleDeleteReceiptProduct = async (id: string) => {
    console.log("Kassenbeleg-Produkt löschen:", id);
    console.log("Aktuelle Kassenbeleg-Produkte:", receiptProducts);
    
    // Produkt aus der Datenbank löschen
    await deleteReceiptProduct(id);
    
    // State aktualisieren
    setReceiptProducts(prevProducts => {
      const newProducts = prevProducts.filter(product => product.id !== id);
      console.log(`Gefilterte Produkte: Vorher: ${prevProducts.length}, Nachher: ${newProducts.length}`);
      return newProducts;
    });
    
    toast({
      title: "Produkt gelöscht",
      description: "Das Produkt wurde erfolgreich gelöscht.",
    });
  };

  const updateProductLists = async () => {
    console.log("Produktlisten nach Quittungsscan oder Bearbeitung aktualisieren");
    // Diese Funktion aktualisiert sowohl Notizen als auch Kassenbeleg-Produkte
    await loadNotes();
    await loadReceiptProducts();
    
    toast({
      title: "Produkt aktualisiert",
      description: "Das Produkt wurde erfolgreich aktualisiert.",
    });
  };

  const handleNoteDelete = (noteId: string) => {
    console.log("Index - Notiz gelöscht, ID:", noteId);
    
    // Notiz-State aktualisieren
    setNotes(currentNotes => {
      const filteredNotes = currentNotes.filter(note => {
        const keep = note.id !== noteId;
        console.log(`Notiz ${note.id} behalten? ${keep} (Vergleich mit ${noteId})`);
        return keep;
      });
      
      console.log("Notizen nach Filterung:", filteredNotes.map(n => n.id));
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
        {!hasMigrated && (
          <MigrationNotification onMigrate={migrateDataToSupabase} />
        )}

        <ActionButtons 
          onProductDialogOpen={() => setProductDialogOpen(true)}
          onScannerDialogOpen={() => setScannerDialogOpen(true)}
        />

        <ProductsContent 
          isLoading={isLoading}
          notes={notes}
          receiptProducts={receiptProducts}
          onNoteDelete={handleNoteDelete}
          onReceiptProductDelete={handleDeleteReceiptProduct}
          onProductUpdate={updateProductLists}
        />

        <DialogContainer 
          productDialogOpen={productDialogOpen}
          setProductDialogOpen={setProductDialogOpen}
          scannerDialogOpen={scannerDialogOpen}
          setScannerDialogOpen={setScannerDialogOpen}
          onProductSave={handleProductSave}
          onProductsUpdated={updateProductLists}
        />
      </div>
    </div>
  );
};

export default Index;
