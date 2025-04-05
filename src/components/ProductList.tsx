
import React, { useState } from 'react';
import { Note, ProductNote, deleteNote } from '../services/noteStorage';
import EmptyProductList from './product/EmptyProductList';
import { cleanProductName } from '../utils/productNameCleaner';
import { FoodCategory, categorizeFoodItem } from '../utils/foodCategories';
import CategoryFilter from './product/CategoryFilter';
import FilteredProductList from './product/FilteredProductList';
import { useProductEdit } from './product/ProductEditHandler';
import EditProductDialog from './product-capture/EditProductDialog';
import { deleteReceiptProduct } from '../services/receiptProductService';

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
  // State for category filtering
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>([]);
  
  // Use the edit hook for handling product editing
  const {
    editDialogOpen,
    currentEditProduct,
    handleEditClick,
    handleEditSave,
    setEditDialogOpen
  } = useProductEdit(onProductUpdate);

  // Show empty state if no products are available
  if (notes.length === 0 && receiptProducts.length === 0) {
    return <EmptyProductList />;
  }

  // Handler for deleting a receipt product
  const handleProductDelete = async (productId: string) => {
    console.log(`ProductList - Produkt mit ID löschen: ${productId}`);
    console.log(`Verfügbare Produkte vor dem Löschen:`, receiptProducts.map(p => p.id));
    
    try {
      // Zuerst das Produkt aus der Datenbank löschen
      await deleteReceiptProduct(productId);
      
      // Dann den UI-State über den Callback aktualisieren
      onReceiptProductDelete(productId);
      
      console.log(`Produkt mit ID ${productId} erfolgreich gelöscht`);
    } catch (error) {
      console.error(`Fehler beim Löschen des Produkts mit ID ${productId}:`, error);
    }
  };

  // Handler for deleting a voice note
  const handleNoteDelete = async (noteId: string) => {
    console.log(`ProductList - Sprachnotiz mit ID löschen: ${noteId}`);
    
    try {
      // Zuerst die Notiz aus der Datenbank löschen
      await deleteNote(noteId);
      
      // Dann den UI-State über den Callback aktualisieren
      onNoteDelete(noteId);
      
      console.log(`Notiz mit ID ${noteId} erfolgreich gelöscht`);
    } catch (error) {
      console.error(`Fehler beim Löschen der Notiz mit ID ${noteId}:`, error);
    }
  };

  // Process voice notes for display
  const processedNotes = notes
    // Sort by timestamp in descending order, newest first
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(note => {
      let displayText = note.text;
      if (displayText.includes('Produkt:')) {
        displayText = displayText.split('\n')[0].replace('Produkt:', '').trim();
      }
      
      // Clean product name
      const cleanedName = cleanProductName(displayText);
      const category = categorizeFoodItem(cleanedName);
      
      return {
        id: note.id,
        name: cleanedName,
        isVoice: true,
        category,
        timestamp: note.timestamp // Include the timestamp property
      };
    });

  // Process receipt products for display
  const processedReceiptProducts = receiptProducts
    // Sort by timestamp in descending order, newest first
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(product => {
      // Clean product name
      const cleanedName = cleanProductName(product.productName);
      const category = categorizeFoodItem(cleanedName);
      
      return {
        id: product.id,
        name: cleanedName,
        isVoice: false,
        category,
        timestamp: product.timestamp // Include the timestamp property
      };
    });

  // Combine all products for display
  const allProducts = [...processedNotes, ...processedReceiptProducts];

  // Toggle category selection
  const toggleCategory = (category: FoodCategory) => {
    setSelectedCategories(current => {
      if (current.includes(category)) {
        return current.filter(c => c !== category);
      } else {
        return [...current, category];
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-4">
      {/* Category filter component */}
      <CategoryFilter 
        selectedCategories={selectedCategories}
        toggleCategory={toggleCategory}
        clearFilters={clearFilters}
      />

      {/* Filtered product list */}
      <FilteredProductList 
        products={allProducts}
        selectedCategories={selectedCategories}
        onDeleteNote={handleNoteDelete}
        onDeleteProduct={handleProductDelete}
        onEditClick={handleEditClick}
        clearFilters={clearFilters}
      />

      {/* Edit dialog */}
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
