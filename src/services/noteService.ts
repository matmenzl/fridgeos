
import { supabase } from './supabaseClient';
import { Note } from './databaseUtils';

/**
 * Saves a new note to the database
 */
export const saveNote = async (text: string): Promise<Note | null> => {
  console.log('Versuche Notiz zu speichern:', text);
  
  const newNote = {
    id: Date.now().toString(),
    text,
    timestamp: Date.now()
  };
  
  try {
    console.log('Sende Notiz an Supabase:', newNote);
    
    const { data, error } = await supabase
      .from('notes')
      .insert(newNote)
      .select()
      .single();
    
    if (error) {
      console.error('Fehler beim Speichern der Notiz:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return null;
    }
    
    console.log('Notiz erfolgreich gespeichert:', data);
    return data;
  } catch (error) {
    console.error('Exception beim Speichern der Notiz:', error);
    if (error instanceof Error) {
      console.error('Fehlerdetails:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
};

/**
 * Retrieves all notes from the database
 */
export const getAllNotes = async (): Promise<Note[]> => {
  console.log('Rufe alle Notizen ab...');
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Fehler beim Abrufen der Notizen:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return [];
    }
    
    console.log(`${data?.length || 0} Notizen erfolgreich abgerufen`);
    return data || [];
  } catch (error) {
    console.error('Exception beim Abrufen der Notizen:', error);
    if (error instanceof Error) {
      console.error('Fehlerdetails:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return [];
  }
};

/**
 * Deletes a note from the database
 */
export const deleteNote = async (id: string): Promise<boolean> => {
  console.log('Lösche Notiz mit ID:', id);
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Fehler beim Löschen der Notiz:', error);
      console.error('Fehlerdetails:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return false;
    }
    
    console.log('Notiz erfolgreich gelöscht');
    return true;
  } catch (error) {
    console.error('Exception beim Löschen der Notiz:', error);
    if (error instanceof Error) {
      console.error('Fehlerdetails:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return false;
  }
};
