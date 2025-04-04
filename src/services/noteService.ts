
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
