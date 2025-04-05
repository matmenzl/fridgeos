
import { STORAGE_KEY } from '../databaseUtils';
import { Note } from '../noteStorage';

/**
 * Get all notes from localStorage
 */
export const getAllNotesFromLocalStorage = (): Note[] => {
  const notesJson = localStorage.getItem(STORAGE_KEY);
  return notesJson ? JSON.parse(notesJson) : [];
};

/**
 * Save a note to localStorage
 */
export const saveNoteToLocalStorage = (note: Note): void => {
  const notes = getAllNotesFromLocalStorage();
  notes.push(note);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

/**
 * Delete a note from localStorage
 */
export const deleteNoteFromLocalStorage = (id: string): void => {
  const notes = getAllNotesFromLocalStorage();
  const updatedNotes = notes.filter(note => note.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
};

/**
 * Update a note in localStorage
 */
export const updateNoteInLocalStorage = (id: string, newText: string): Note | null => {
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
};
