
import { useState, useEffect } from 'react';
import { Note, ProductNote, getAllNotes, getAllReceiptProducts, saveNote } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";

export const useProductData = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [receiptProducts, setReceiptProducts] = useState<ProductNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
    await loadNotes();
    await loadReceiptProducts();
  };

  const handleNoteDelete = (noteId: string) => {
    console.log("useProductData - Notiz gelöscht, ID:", noteId);
    
    setNotes(currentNotes => {
      const filteredNotes = currentNotes.filter(note => {
        const keep = note.id !== noteId;
        console.log(`Notiz ${note.id} behalten? ${keep} (Vergleich mit ${noteId})`);
        return keep;
      });
      
      console.log("Notizen nach Filterung:", filteredNotes.map(n => n.id));
      return filteredNotes;
    });
  };

  const handleReceiptProductDelete = (id: string) => {
    console.log("Kassenbeleg-Produkt löschen:", id);
    console.log("Aktuelle Kassenbeleg-Produkte:", receiptProducts);
    
    setReceiptProducts(prevProducts => {
      const newProducts = prevProducts.filter(product => product.id !== id);
      console.log(`Gefilterte Produkte: Vorher: ${prevProducts.length}, Nachher: ${newProducts.length}`);
      return newProducts;
    });
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

  useEffect(() => {
    loadData();
  }, []);

  return {
    notes,
    receiptProducts,
    isLoading,
    loadData,
    updateProductLists,
    handleNoteDelete,
    handleReceiptProductDelete,
    handleProductSave
  };
};
