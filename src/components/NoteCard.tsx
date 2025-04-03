
import React from 'react';
import { Trash } from 'lucide-react';
import { Note, deleteNote } from '../services/noteStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onDelete }) => {
  const handleDelete = () => {
    deleteNote(note.id);
    onDelete();
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <p className="text-left break-words">{note.text}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {format(note.timestamp, 'dd.MM.yyyy HH:mm', { locale: de })}
        </span>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
          <Trash size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoteCard;
