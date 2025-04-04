
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
    // Save the product name directly
    if (data.metadata.product && data.metadata.product.trim()) {
      // Save the product name as the note text, not the formatted text
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

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 md:p-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Fridgie</h1>
        <p className="text-muted-foreground">Food-Checkin- und Checkout für möglichst wenig Foodwaste in deinem Zuhause.</p>
      </header>

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

      <h2 className="text-xl font-semibold mb-4">Erfasste Lebensmittel</h2>
      
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
      
      {/* Pass both notes and receiptProducts to MenuSuggestions */}
      <MenuSuggestions notes={notes} receiptProducts={receiptProducts} />

      <ProductCaptureDialog 
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={handleProductSave}
      />
      
      <ReceiptScanner
        open={scannerDialogOpen}
        onOpenChange={setScannerDialogOpen}
      />
    </div>
  );
};

export default Index;
