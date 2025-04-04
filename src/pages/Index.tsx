
import React, { useState, useEffect } from 'react';
import SpeechInput from '../components/SpeechInput';
import NoteCard from '../components/NoteCard';
import MenuSuggestions from '../components/MenuSuggestions';
import { getAllNotes, saveNote, Note, getAllReceiptProducts, ProductNote, deleteReceiptProduct } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Scan, ShoppingBag, Trash } from "lucide-react";
import ProductCaptureDialog from '../components/product-capture/ProductCaptureDialog';
import ReceiptScanner from '../components/ReceiptScanner';

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
    const savedNotes = getAllNotes();
    setNotes(savedNotes);
  };

  const loadReceiptProducts = () => {
    const savedProducts = getAllReceiptProducts();
    setReceiptProducts(savedProducts);
  };

  const handleTranscriptComplete = (transcript: string) => {
    if (transcript.trim()) {
      saveNote(transcript.trim());
      loadNotes();
      toast({
        title: "Notiz gespeichert",
        description: "Deine Sprachnotiz wurde erfolgreich gespeichert.",
      });
    }
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
        description: `"${productName}" wurde erfolgreich gespeichert.`,
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
    deleteReceiptProduct(id);
    loadReceiptProducts();
    toast({
      title: "Produkt gelöscht",
      description: "Das Produkt wurde erfolgreich gelöscht.",
    });
  };

  const updateProductLists = () => {
    // This function refreshes both notes and receipt products
    loadNotes();
    loadReceiptProducts();
  };

  return (
    <div className="min-h-screen">
      <header className="fridgie-header-gradient w-full py-8 mb-8 text-center">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center justify-center">
          <img 
            src="/lovable-uploads/2c44a1ec-8500-48eb-90d2-e51d8a384253.png" 
            alt="FridgeOS Logo" 
            className="h-10 mr-2" 
          />
          <span>FridgeOS</span>
        </h1>
        <p className="text-white/90 text-lg">
          Dein smarter Kühlschrankverwalter mit KI-basierten Rezeptvorschlägen.
        </p>
      </header>

      <div className="px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Button 
            onClick={() => setProductDialogOpen(true)}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Plus size={24} />
            <span>Produkt per Voice erfassen</span>
          </Button>
          
          <Button 
            onClick={() => setScannerDialogOpen(true)}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Scan size={24} />
            <span>Quittung scannen</span>
          </Button>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">Erfasste Lebensmittel</h2>
        
        <div className="grid gap-4 mb-8">
          {notes.length > 0 && (
            notes.sort((a, b) => b.timestamp - a.timestamp).map((note) => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onDelete={loadNotes} 
              />
            ))
          )}
          
          {receiptProducts.length > 0 && (
            receiptProducts.sort((a, b) => b.timestamp - a.timestamp).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <span>{product.productName}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteReceiptProduct(product.id)} 
                  className="text-destructive h-8 w-8"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
          
          {notes.length === 0 && receiptProducts.length === 0 && (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p className="text-muted-foreground">
                Keine Lebensmittel vorhanden. Erfasse dein erstes Produkt!
              </p>
            </div>
          )}
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
