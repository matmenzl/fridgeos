
import React from 'react';
import { Trash, Edit, Minus, Plus } from 'lucide-react';
import { Note, deleteNote } from '../services/noteStorage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Check if the note is a multi-line formatted product note
  const isFormattedProduct = note.text.includes('Produkt:') && note.text.includes('Ablaufdatum:');
  
  // Extract just the product name if it's a formatted product note
  const displayText = isFormattedProduct
    ? note.text.split('\n')[0].replace('Produkt:', '').trim()
    : note.text;

  // Check for expiry date information
  const hasExpiryDate = note.text.includes('Ablaufdatum:');
  let expiryDate = '';
  if (hasExpiryDate) {
    const expiryLine = note.text.split('\n').find(line => line.includes('Ablaufdatum:'));
    if (expiryLine) {
      expiryDate = expiryLine.replace('Ablaufdatum:', '').trim();
    }
  }

  // Extract category if available (assuming it's on the last line)
  let category = '';
  if (isFormattedProduct && note.text.split('\n').length > 2) {
    category = note.text.split('\n')[note.text.split('\n').length - 1].trim();
  }

  return (
    <Card className="w-full p-4 rounded-xl shadow-sm border-0">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold">{displayText}</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-medium">500</span>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-gray-500 text-lg">500 g</div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {hasExpiryDate && expiryDate === 'today' && (
              <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200 rounded-full px-4 py-1">
                Expires today
              </Badge>
            )}
            {category && (
              <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200 rounded-full px-4 py-1">
                {category}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 h-10 w-10">
              <Edit className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-gray-400 h-10 w-10">
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NoteCard;
