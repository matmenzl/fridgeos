
import React from 'react';
import NoteCard from './NoteCard';
import { ShoppingBag, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note, ProductNote } from '../services/databaseUtils';
import { Card } from '@/components/ui/card';

interface ProductListProps {
  notes: Note[];
  receiptProducts: ProductNote[];
  onNoteDelete: (noteId: string) => void;
  onReceiptProductDelete: (id: string) => void;
  isLoading?: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ 
  notes, 
  receiptProducts, 
  onNoteDelete, 
  onReceiptProductDelete,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        notes.map((note) => (
          <NoteCard 
            key={note.id} 
            note={note} 
            onDelete={onNoteDelete} 
          />
        ))
      )}
      
      {receiptProducts.length > 0 && (
        receiptProducts.map((product) => (
          <Card key={product.id} className="w-full p-4 rounded-xl shadow-sm border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="text-xl font-bold">{product.productName}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onReceiptProductDelete(product.id)} 
                className="text-gray-400 h-10 w-10"
              >
                <Trash className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default ProductList;
