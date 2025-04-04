
import React, { useState, useEffect } from 'react';
import SpeechInput from '../components/SpeechInput';
import NoteCard from '../components/NoteCard';
import { getAllNotes, saveNote, Note } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Scan, Mic } from "lucide-react";
import ProductCaptureDialog from '../components/ProductCaptureDialog';
import ReceiptScanner from '../components/ReceiptScanner';

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [scannerDialogOpen, setScannerDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const savedNotes = getAllNotes();
    setNotes(savedNotes);
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
    if (data.text.trim()) {
      saveNote(data.text.trim());
      loadNotes();
      toast({
        title: "Produkt gespeichert",
        description: "Dein Produkt wurde erfolgreich gespeichert.",
      });
    }
  };

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 md:p-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Sprach-Speicher</h1>
        <p className="text-muted-foreground">Nimm Sprachnotizen auf und erfasse Produkte</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Button 
          onClick={() => setProductDialogOpen(true)}
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <Plus size={24} />
          <span>Produkt erfassen</span>
        </Button>
        
        <div className="flex justify-center">
          <SpeechInput onTranscriptComplete={handleTranscriptComplete} />
        </div>
        
        <Button 
          onClick={() => setScannerDialogOpen(true)}
          variant="outline"
          className="flex flex-col items-center gap-2 h-auto py-4"
        >
          <Scan size={24} />
          <span>Quittung scannen</span>
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Gespeicherte Notizen</h2>
      
      <div className="grid gap-4">
        {notes.length > 0 ? (
          notes.sort((a, b) => b.timestamp - a.timestamp).map((note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onDelete={loadNotes} 
            />
          ))
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              Keine Notizen vorhanden. Nimm deine erste Sprachnotiz auf!
            </p>
          </div>
        )}
      </div>

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
