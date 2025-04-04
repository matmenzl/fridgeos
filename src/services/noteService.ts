
import { STORAGE_KEY } from './databaseUtils';
import { BaseDataService, BaseItem } from './baseDataService';
import { Note } from './noteStorage';

// Define the database note type
interface DbNote {
  id: string;
  text: string;
  timestamp: number;
}

class NoteService extends BaseDataService<Note, DbNote> {
  constructor() {
    super(
      'notes',
      STORAGE_KEY,
      // Map from DB to Note format
      (dbItem: any): Note => ({
        id: dbItem.id,
        text: dbItem.text,
        timestamp: dbItem.timestamp
      }),
      // Map from Note to DB format
      (note: Note): Omit<DbNote, 'id'> => ({
        text: note.text,
        timestamp: note.timestamp
      })
    );
  }

  // Special methods specific to notes could be added here
}

// Create a singleton instance
const noteService = new NoteService();

// Export the service functions
export const saveNote = async (text: string): Promise<Note> => {
  const newNote = await noteService.create({ text, timestamp: Date.now() });
  return newNote;
};

export const getAllNotes = async (): Promise<Note[]> => {
  return noteService.getAll();
};

export const deleteNote = async (id: string): Promise<void> => {
  return noteService.delete(id);
};

export const updateNote = async (id: string, newText: string): Promise<Note | null> => {
  return noteService.update(id, { text: newText });
};

export const migrateNotesToSupabase = async (): Promise<boolean> => {
  const localNotes = noteService.getFromLocalStorage();
  return noteService.migrateToSupabase(localNotes);
};
