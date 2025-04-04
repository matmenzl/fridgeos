
import React, { useState } from 'react';
import { Note, ProductNote, deleteNote, updateNote, updateReceiptProduct } from '../services/noteStorage';
import EditProductDialog from './product-capture/EditProductDialog';
import ProductCard from './product/ProductCard';
import EmptyProductList from './product/EmptyProductList';
import { cleanProductName } from '../utils/productNameCleaner';
import { FoodCategory, categorizeFoodItem, getAllFoodCategories } from '../utils/foodCategorization';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

  // State for category filtering
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>([]);
  const allCategories = getAllFoodCategories();

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
    // Ensure the name is cleaned before showing in the editor
    const cleanedName = cleanProductName(name);
    
    setCurrentEditProduct({
      id,
      productName: cleanedName,
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
      const category = categorizeFoodItem(cleanedName);
      
      return {
        id: note.id,
        name: cleanedName,
        isVoice: true,
        category
      };
    });

  // Process receipt products for display
  const processedReceiptProducts = receiptProducts
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(product => {
      // Clean the product name - apply rigorous cleaning
      const cleanedName = cleanProductName(product.productName);
      const category = categorizeFoodItem(cleanedName);
      
      return {
        id: product.id,
        name: cleanedName,
        isVoice: false,
        category
      };
    });

  // Filter products by selected categories
  const filteredProducts = [...processedNotes, ...processedReceiptProducts].filter(item => {
    if (selectedCategories.length === 0) return true; // Show all if no filter is applied
    return selectedCategories.includes(item.category);
  });

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
      {/* Category filter */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter nach Kategorie:</span>
          {selectedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge key={category} className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" onClick={() => toggleCategory(category)}>
                  {category} ✕
                </Badge>
              ))}
              {selectedCategories.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                  Alle zurücksetzen
                </Button>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Keine Filter aktiv</span>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2">
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {allCategories.map(category => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedCategories.includes(category)}
                onSelect={(e) => {
                  e.preventDefault();
                  toggleCategory(category);
                }}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4">
        {filteredProducts.map(item => (
          <ProductCard
            key={item.id}
            id={item.id}
            name={item.name}
            isVoice={item.isVoice}
            category={item.category}
            onDelete={item.isVoice ? handleNoteDelete : handleProductDelete}
            onEdit={handleEditClick}
          />
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p className="text-muted-foreground">
              Keine Produkte für die ausgewählten Kategorien gefunden.
            </p>
            {selectedCategories.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">
                Filter zurücksetzen
              </Button>
            )}
          </div>
        )}
      </div>

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
