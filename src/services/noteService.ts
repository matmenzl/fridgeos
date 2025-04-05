
// Re-export all note-related functions from their respective modules

import {
  saveNote,
  getAllNotes,
  deleteNote,
  updateNote,
  migrateNotesToSupabase
} from './notes/noteOperations';

export {
  saveNote,
  getAllNotes,
  deleteNote,
  updateNote,
  migrateNotesToSupabase
};
