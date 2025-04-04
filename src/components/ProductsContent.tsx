
import React from 'react';
import { Note, ProductNote } from '../services/noteStorage';
import ProductList from './ProductList';
import LoadingSpinner from './LoadingSpinner';
import MenuSuggestions from './MenuSuggestions';

interface ProductsContentProps {
  isLoading: boolean;
  notes: Note[];
  receiptProducts: ProductNote[];
  onNoteDelete: (noteId: string) => void;
  onReceiptProductDelete: (id: string) => void;
  onProductUpdate: () => void;
}

const ProductsContent: React.FC<ProductsContentProps> = ({
  isLoading,
  notes,
  receiptProducts,
  onNoteDelete,
  onReceiptProductDelete,
  onProductUpdate
}) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Erfasste Lebensmittel</h2>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mb-8">
          <ProductList 
            notes={notes}
            receiptProducts={receiptProducts}
            onNoteDelete={onNoteDelete}
            onReceiptProductDelete={onReceiptProductDelete}
            onProductUpdate={onProductUpdate}
          />
        </div>
      )}
      
      <MenuSuggestions notes={notes} receiptProducts={receiptProducts} />
    </>
  );
};

export default ProductsContent;
