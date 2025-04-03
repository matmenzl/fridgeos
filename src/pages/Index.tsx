
import React, { useState, useEffect } from 'react';
import SpeechInput from '../components/SpeechInput';
import NoteCard from '../components/NoteCard';
import { getAllNotes, saveNote, Note } from '../services/noteStorage';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
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

  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 md:p-6">
      <header className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Sprach-Speicher</h1>
        <p className="text-muted-foreground">Nimm Sprachnotizen auf und speichere sie</p>
      </header>

      <div className="mb-8">
        <SpeechInput onTranscriptComplete={handleTranscriptComplete} />
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
    </div>
  );
};

export default Index;
