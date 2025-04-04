
import React, { useState } from 'react';
import { Note, ProductNote, deleteNote, updateNote, updateReceiptProduct } from '../services/noteStorage';
import EditProductDialog from './product-capture/EditProductDialog';
import ProductCard from './product/ProductCard';
import EmptyProductList from './product/EmptyProductList';
import { cleanProductName } from '../utils/productNameCleaner';

interface ProductListProps {
  notes: Note[];
  receiptProducts: ProductNote[];
  onNoteDelete: (noteId: string) => void;
  onReceiptProductDelete: (id: string) => void;
  onProductUpdate: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
  notes, 
  receiptProducts, 
  onNoteDelete, 
  onReceiptProductDelete,
  onProductUpdate
}) => {
  // State for the edit dialog
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

  // Show empty state if no products
  if (notes.length === 0 && receiptProducts.length === 0) {
    return <EmptyProductList />;
  }

  // Handler for receipt product deletion
  const handleProductDelete = (productId: string) => {
    console.log(`ProductList - Deleting product with ID: ${productId}`);
    console.log(`Available products before delete:`, receiptProducts.map(p => p.id));
    onReceiptProductDelete(productId);
  };

  // Handler for voice note deletion
  const handleNoteDelete = (noteId: string) => {
    console.log(`ProductList - Deleting voice note with ID: ${noteId}`);
    deleteNote(noteId);
    onNoteDelete(noteId);
  };

  // Handler for edit button click
  const handleEditClick = (id: string, name: string, isVoice: boolean) => {
    setCurrentEditProduct({
      id,
      productName: name,
      isVoiceNote: isVoice
    });
    setEditDialogOpen(true);
  };

  // Handler for saving edited product
  const handleEditSave = (data: any) => {
    console.log('Saving edited product:', data);
    
    if (data.isVoiceNote) {
      const formattedText = `Produkt: ${data.product}`;
      updateNote(data.id, formattedText);
    } else {
      updateReceiptProduct(data.id, data.product);
    }
    
    onProductUpdate();
  };

  // Process voice notes for display
  const processedNotes = notes
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(note => {
      let displayText = note.text;
      if (displayText.includes('Produkt:')) {
        displayText = displayText.split('\n')[0].replace('Produkt:', '').trim();
      }
      
      // Clean the product name
      const cleanedName = cleanProductName(displayText);
      
      return {
        id: note.id,
        name: cleanedName,
        isVoice: true
      };
    });

  // Process receipt products for display
  const processedReceiptProducts = receiptProducts
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(product => {
      // Clean the product name
      const cleanedName = cleanProductName(product.productName);
      
      return {
        id: product.id,
        name: cleanedName,
        isVoice: false
      };
    });

  return (
    <div className="grid gap-4">
      {processedNotes.map(item => (
        <ProductCard
          key={item.id}
          id={item.id}
          name={item.name}
          isVoice={item.isVoice}
          onDelete={handleNoteDelete}
          onEdit={handleEditClick}
        />
      ))}
      
      {processedReceiptProducts.map(item => (
        <ProductCard
          key={item.id}
          id={item.id}
          name={item.name}
          isVoice={item.isVoice}
          onDelete={handleProductDelete}
          onEdit={handleEditClick}
        />
      ))}

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
