import { STORAGE_KEY } from './databaseUtils';
import { Note } from './noteStorage';

export const saveNote = (text: string): Note => {
  const notes = getAllNotes();
  
  const newNote: Note = {
    id: Date.now().toString(),
    text,
    timestamp: Date.now()
  };
  
  notes.push(newNote);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  
  return newNote;
};

export const getAllNotes = (): Note[] => {
  const notesJson = localStorage.getItem(STORAGE_KEY);
  return notesJson ? JSON.parse(notesJson) : [];
};

export const deleteNote = (id: string): void => {
  const notes = getAllNotes();
  const updatedNotes = notes.filter(note => note.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
};

export const updateNote = (id: string, newText: string): Note | null => {
  const notes = getAllNotes();
  const noteIndex = notes.findIndex(note => note.id === id);
  
  if (noteIndex === -1) {
    console.error(`Note with ID ${id} not found`);
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
