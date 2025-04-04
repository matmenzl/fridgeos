
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
      console.log("Loading data from Supabase...");
      const notesData = await getAllNotes();
      const productsData = await getAllReceiptProducts();
      
      console.log("Loaded notes:", notesData.length);
      console.log("Loaded receipt products:", productsData.length);
      
      // Sort items by timestamp (newest first) as soon as we get them
      const sortedNotes = notesData.sort((a, b) => b.timestamp - a.timestamp);
      const sortedProducts = productsData.sort((a, b) => b.timestamp - a.timestamp);
      
      setNotes(sortedNotes);
      setReceiptProducts(sortedProducts);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error loading",
        description: "Data could not be loaded. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    console.log("Loading notes...");
    const savedNotes = await getAllNotes();
    console.log("Loaded notes:", savedNotes.length);
    // Sort by timestamp (newest first)
    const sortedNotes = savedNotes.sort((a, b) => b.timestamp - a.timestamp);
    setNotes(sortedNotes);
  };

  const loadReceiptProducts = async () => {
    console.log("Loading receipt products...");
    const savedProducts = await getAllReceiptProducts();
    console.log("Loaded receipt products:", savedProducts.length);
    // Sort by timestamp (newest first)
    const sortedProducts = savedProducts.sort((a, b) => b.timestamp - a.timestamp);
    setReceiptProducts(sortedProducts);
  };

  const updateProductLists = async () => {
    console.log("Updating product lists after receipt scan or edit");
    await loadNotes();
    await loadReceiptProducts();
  };

  const handleNoteDelete = (noteId: string) => {
    console.log("useProductData - Note deleted, ID:", noteId);
    
    setNotes(currentNotes => {
      const filteredNotes = currentNotes.filter(note => {
        const keep = note.id !== noteId;
        console.log(`Keep note ${note.id}? ${keep} (compared with ${noteId})`);
        return keep;
      });
      
      console.log("Notes after filtering:", filteredNotes.map(n => n.id));
      return filteredNotes;
    });
  };

  const handleReceiptProductDelete = (id: string) => {
    console.log("Delete receipt product:", id);
    console.log("Current receipt products:", receiptProducts);
    
    setReceiptProducts(prevProducts => {
      const newProducts = prevProducts.filter(product => product.id !== id);
      console.log(`Filtered products: Before: ${prevProducts.length}, After: ${newProducts.length}`);
      return newProducts;
    });
  };

  const handleProductSave = async (data: { text: string, metadata: any }) => {
    console.log("Save product:", data);
    if (data.metadata.product && data.metadata.product.trim()) {
      const productName = data.metadata.product.trim();
      console.log("Save product name:", productName);
      await saveNote(productName);
      await loadNotes();
      toast({
        title: "Product saved",
        description: `"${productName}" has been successfully saved.`,
      });
    } else {
      console.error("No product name found in:", data);
      toast({
        title: "Error",
        description: "An error occurred while saving the product.",
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
