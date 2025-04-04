
import { STORAGE_KEY } from './databaseUtils';
import { Note } from './noteStorage';
import { supabase } from '../integrations/supabase/client';

// Funktion zum Speichern einer Notiz in Supabase
export const saveNote = async (text: string): Promise<Note> => {
  const newNote: Note = {
    id: Date.now().toString(),
    text,
    timestamp: Date.now()
  };
  
  try {
    // In Supabase speichern
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        text: newNote.text,
        timestamp: newNote.timestamp,
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern der Notiz in Supabase:', error);
      // Fallback: In localStorage speichern
      const notes = getAllNotesFromLocalStorage();
      notes.push(newNote);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } else {
      // Die von Supabase generierte UUID verwenden
      newNote.id = data.id;
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Notiz:', error);
    // Fallback: In localStorage speichern
    const notes = getAllNotesFromLocalStorage();
    notes.push(newNote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }
  
  return newNote;
};

// Hilfsfunktion zum Abrufen aller Notizen aus localStorage
const getAllNotesFromLocalStorage = (): Note[] => {
  const notesJson = localStorage.getItem(STORAGE_KEY);
  return notesJson ? JSON.parse(notesJson) : [];
};

// Funktion zum Abrufen aller Notizen aus Supabase
export const getAllNotes = async (): Promise<Note[]> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Notizen aus Supabase:', error);
      // Fallback: Aus localStorage abrufen
      return getAllNotesFromLocalStorage();
    }
    
    // Notizen in das richtige Format konvertieren
    return data.map(note => ({
      id: note.id,
      text: note.text,
      timestamp: note.timestamp
    }));
  } catch (error) {
    console.error('Fehler beim Abrufen der Notizen:', error);
    // Fallback: Aus localStorage abrufen
    return getAllNotesFromLocalStorage();
  }
};

// Funktion zum Löschen einer Notiz in Supabase
export const deleteNote = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Fehler beim Löschen der Notiz mit ID ${id} in Supabase:`, error);
      // Fallback: Aus localStorage löschen
      const notes = getAllNotesFromLocalStorage();
      const updatedNotes = notes.filter(note => note.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
    }
  } catch (error) {
    console.error(`Fehler beim Löschen der Notiz mit ID ${id}:`, error);
    // Fallback: Aus localStorage löschen
    const notes = getAllNotesFromLocalStorage();
    const updatedNotes = notes.filter(note => note.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
  }
};

// Funktion zum Aktualisieren einer Notiz in Supabase
export const updateNote = async (id: string, newText: string): Promise<Note | null> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ text: newText, timestamp: Date.now() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Fehler beim Aktualisieren der Notiz mit ID ${id} in Supabase:`, error);
      // Fallback: In localStorage aktualisieren
      const notes = getAllNotesFromLocalStorage();
      const noteIndex = notes.findIndex(note => note.id === id);
      
      if (noteIndex === -1) {
        console.error(`Notiz mit ID ${id} nicht gefunden`);
        return null;
      }
      
      const updatedNote: Note = {
        ...notes[noteIndex],
        text: newText,
        timestamp: Date.now()
      };
      
      notes[noteIndex] = updatedNote;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      
      return updatedNote;
    }
    
    // Die aktualisierte Notiz zurückgeben
    return {
      id: data.id,
      text: data.text,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error(`Fehler beim Aktualisieren der Notiz mit ID ${id}:`, error);
    // Fallback: In localStorage aktualisieren
    const notes = getAllNotesFromLocalStorage();
    const noteIndex = notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      console.error(`Notiz mit ID ${id} nicht gefunden`);
      return null;
    }
    
    const updatedNote: Note = {
      ...notes[noteIndex],
      text: newText,
      timestamp: Date.now()
    };
    
    notes[noteIndex] = updatedNote;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    
    return updatedNote;
  }
};

// Funktion zum Migrieren aller Notizen von localStorage zu Supabase
export const migrateNotesToSupabase = async (): Promise<boolean> => {
  try {
    const localNotes = getAllNotesFromLocalStorage();
    
    if (localNotes.length === 0) {
      console.log('Keine lokalen Notizen zum Migrieren gefunden.');
      return true;
    }
    
    // Notizen für Supabase vorbereiten
    const notesForSupabase = localNotes.map(note => ({
      text: note.text,
      timestamp: note.timestamp
    }));
    
    // Notizen in Supabase speichern
    const { error } = await supabase
      .from('notes')
      .insert(notesForSupabase);
    
    if (error) {
      console.error('Fehler beim Migrieren der Notizen zu Supabase:', error);
      return false;
    }
    
    console.log(`${localNotes.length} Notizen erfolgreich zu Supabase migriert.`);
    return true;
  } catch (error) {
    console.error('Fehler beim Migrieren der Notizen:', error);
    return false;
  }
};
