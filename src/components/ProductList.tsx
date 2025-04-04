
import React, { useState } from 'react';
import { ShoppingBag, Trash, Mic, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note, ProductNote, deleteNote, updateNote, updateReceiptProduct } from '../services/noteStorage';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EditProductDialog from './product-capture/EditProductDialog';

interface ProductListProps {
  notes: Note[];
  receiptProducts: ProductNote[];
  onNoteDelete: (noteId: string) => void;
  onReceiptProductDelete: (id: string) => void;
  onProductUpdate: () => void; // New prop to refresh product lists after update
}

const ProductList: React.FC<ProductListProps> = ({ 
  notes, 
  receiptProducts, 
  onNoteDelete, 
  onReceiptProductDelete,
  onProductUpdate
}) => {
  // Add state for the edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditProduct, setCurrentEditProduct] = useState<{
    id: string;
    productName: string;
    isVoiceNote: boolean;
  }>({
    id: '',
    productName: '',
    isVoiceNote: false
  });

  if (notes.length === 0 && receiptProducts.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        <p className="text-muted-foreground">
          Keine Lebensmittel vorhanden. Erfasse dein erstes Produkt!
        </p>
      </div>
    );
  }

  // Handler with additional logging
  const handleProductDelete = (productId: string) => {
    console.log(`ProductList - Deleting product with ID: ${productId}`);
    console.log(`Available products before delete:`, receiptProducts.map(p => p.id));
    onReceiptProductDelete(productId);
  };

  // Handler for voice note deletion with additional logging
  const handleNoteDelete = (noteId: string) => {
    console.log(`ProductList - Deleting voice note with ID: ${noteId}`);
    // First delete from storage
    deleteNote(noteId);
    // Then notify parent component to update state
    onNoteDelete(noteId);
  };

  // New handler for edit button click
  const handleEditClick = (id: string, name: string, isVoice: boolean) => {
    setCurrentEditProduct({
      id,
      productName: name,
      isVoiceNote: isVoice
    });
    setEditDialogOpen(true);
  };

  // New handler for saving edited product
  const handleEditSave = (data: any) => {
    console.log('Saving edited product:', data);
    
    if (data.isVoiceNote) {
      // For voice notes, we need to format the text similar to when we create it
      const formattedText = `Produkt: ${data.product}${data.quantity ? `\nMenge: ${data.quantity}` : ''}`;
      updateNote(data.id, formattedText);
    } else {
      // For receipt products, we just update the product name
      updateReceiptProduct(data.id, data.product);
    }
    
    // Notify parent to refresh lists
    onProductUpdate();
  };

  // Display a product card with consistent UI
  const renderProductCard = (
    id: string, 
    name: string, 
    isVoice: boolean, 
    onDeleteFn: (id: string) => void
  ) => {
    return (
      <Card key={id} className="w-full p-4 rounded-xl shadow-sm border-0">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {isVoice ? (
                <Mic className="h-4 w-4 text-primary" />
              ) : (
                <ShoppingBag className="h-4 w-4 text-primary" />
              )}
              <h3 className="text-xl font-bold">{name}</h3>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200 rounded-full px-4 py-1">
                {isVoice ? 'Spracherfassung' : 'Bonerfassung'}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEditClick(id, name, isVoice)}
                className="text-gray-400 h-10 w-10"
              >
                <Edit className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDeleteFn(id)} 
                className="text-gray-400 h-10 w-10"
              >
                <Trash className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="grid gap-4">
      {notes.length > 0 && (
        notes
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((note) => {
            // Extract just the product name if it's a formatted product note
            const isFormattedProduct = note.text.includes('Produkt:') && note.text.includes('Ablaufdatum:');
            const displayText = isFormattedProduct
              ? note.text.split('\n')[0].replace('Produkt:', '').trim()
              : note.text;
            
            return renderProductCard(note.id, displayText, true, handleNoteDelete);
          })
      )}
      
      {receiptProducts.length > 0 && (
        receiptProducts
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((product) => 
            renderProductCard(product.id, product.productName, false, handleProductDelete)
          )
      )}

      {/* Add the EditProductDialog component */}
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditSave}
        initialData={currentEditProduct}
      />
    </div>
  );
};

export default ProductList;
