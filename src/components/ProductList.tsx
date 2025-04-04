
import React from 'react';
import NoteCard from './NoteCard';
import { ShoppingBag, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note, ProductNote } from '../services/noteStorage';

interface ProductListProps {
  notes: Note[];
  receiptProducts: ProductNote[];
  onNoteDelete: (noteId: string) => void;
  onReceiptProductDelete: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  notes, 
  receiptProducts, 
  onNoteDelete, 
  onReceiptProductDelete 
}) => {
  if (notes.length === 0 && receiptProducts.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <p className="text-muted-foreground">
          Keine Lebensmittel vorhanden. Erfasse dein erstes Produkt!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {notes.length > 0 && (
        notes.sort((a, b) => b.timestamp - a.timestamp).map((note) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            onDelete={onNoteDelete} 
          />
        ))
      )}
      
      {receiptProducts.length > 0 && (
        receiptProducts.sort((a, b) => b.timestamp - a.timestamp).map((product) => (
          <div key={product.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>{product.productName}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onReceiptProductDelete(product.id)} 
              className="text-destructive h-8 w-8"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductList;
