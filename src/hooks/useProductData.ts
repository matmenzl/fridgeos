
import { useState, useEffect } from 'react';
import { 
  Note, 
  ProductNote, 
  getAllNotes, 
  migrateNotesToSupabase, 
  migrateReceiptProductsToSupabase 
} from '../services/noteStorage';
import { 
  getAllReceiptProducts, 
  deleteReceiptProduct 
} from '../services/receiptProductService';
import { useToast } from "@/hooks/use-toast";

export function useProductData() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [receiptProducts, setReceiptProducts] = useState<ProductNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState<boolean>(
    localStorage.getItem('dataMigratedToSupabase') === 'true'
  );
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

  const handleNoteDelete = async (noteId: string) => {
    console.log("useProductData - Notiz gelöscht, ID:", noteId);
    
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

  const handleDeleteReceiptProduct = async (id: string) => {
    console.log("useProductData - Kassenbeleg-Produkt löschen:", id);
    console.log("Aktuelle Kassenbeleg-Produkte vor dem Löschen:", receiptProducts.map(p => p.id));
    
    // State aktualisieren
    setReceiptProducts(prevProducts => {
      const newProducts = prevProducts.filter(product => {
        const keep = product.id !== id;
        console.log(`Produkt ${product.id} behalten? ${keep} (Vergleich mit ${id})`);
        return keep;
      });
      console.log(`Gefilterte Produkte: Vorher: ${prevProducts.length}, Nachher: ${newProducts.length}`);
      console.log("Produkte nach Filterung:", newProducts.map(p => p.id));
      return newProducts;
    });
    
    toast({
      title: "Produkt gelöscht",
      description: "Das Produkt wurde erfolgreich gelöscht.",
    });
  };

  return {
    notes,
    receiptProducts,
    isLoading,
    hasMigrated,
    setHasMigrated,
    loadData,
    migrateDataToSupabase,
    handleNoteDelete,
    handleDeleteReceiptProduct,
    updateProductLists,
  };
}
