
import { supabase } from '../../integrations/supabase/client';
import { Note } from '../noteStorage';
import { 
  getAllNotesFromLocalStorage, 
  saveNoteToLocalStorage, 
  deleteNoteFromLocalStorage,
  updateNoteInLocalStorage
} from './noteLocalStorage';
import { fetchAllItems } from '../db/supabaseUtils';

/**
 * Funktion zum Speichern einer Notiz in Supabase
 */
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
      saveNoteToLocalStorage(newNote);
    } else if (data) {
      // Die von Supabase generierte UUID verwenden
      newNote.id = data.id;
    }
  } catch (error) {
    console.error('Fehler beim Speichern der Notiz:', error);
    // Fallback: In localStorage speichern
    saveNoteToLocalStorage(newNote);
  }
  
  return newNote;
};

/**
 * Funktion zum Abrufen aller Notizen aus Supabase
 */
export const getAllNotes = async (): Promise<Note[]> => {
  return fetchAllItems<Note>(
    'notes',
    'timestamp',
    getAllNotesFromLocalStorage,
    (note) => ({
      id: note.id,
      text: note.text,
      timestamp: note.timestamp
    })
  );
};

/**
 * Funktion zum Löschen einer Notiz in Supabase
 */
export const deleteNote = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Fehler beim Löschen der Notiz mit ID ${id} in Supabase:`, error);
      // Fallback: Aus localStorage löschen
      deleteNoteFromLocalStorage(id);
    }
  } catch (error) {
    console.error(`Fehler beim Löschen der Notiz mit ID ${id}:`, error);
    // Fallback: Aus localStorage löschen
    deleteNoteFromLocalStorage(id);
  }
};

/**
 * Funktion zum Aktualisieren einer Notiz in Supabase
 */
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
      return updateNoteInLocalStorage(id, newText);
    }
    
    if (!data) {
      return null;
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
    return updateNoteInLocalStorage(id, newText);
  }
};

/**
 * Funktion zum Migrieren aller Notizen von localStorage zu Supabase
 */
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
