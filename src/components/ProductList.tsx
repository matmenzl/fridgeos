
import React, { useState } from 'react';
import { Note, ProductNote, deleteNote, updateNote, updateReceiptProduct } from '../services/noteStorage';
import EditProductDialog from './product-capture/EditProductDialog';
import ProductCard from './product/ProductCard';
import EmptyProductList from './product/EmptyProductList';
import { cleanProductName } from '../utils/productNameCleaner';
import { FoodCategory, categorizeFoodItem, getAllFoodCategories } from '../utils/foodCategories';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";

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
  // State für den Edit-Dialog
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

  // State für die Kategorie-Filterung
  const [selectedCategories, setSelectedCategories] = useState<FoodCategory[]>([]);
  const allCategories = getAllFoodCategories();
  const { toast } = useToast();

  // Leeren Zustand anzeigen, wenn keine Produkte vorhanden sind
  if (notes.length === 0 && receiptProducts.length === 0) {
    return <EmptyProductList />;
  }

  // Handler für die Löschung eines Kassenbeleg-Produkts
  const handleProductDelete = (productId: string) => {
    console.log(`ProductList - Produkt mit ID löschen: ${productId}`);
    console.log(`Verfügbare Produkte vor dem Löschen:`, receiptProducts.map(p => p.id));
    onReceiptProductDelete(productId);
  };

  // Handler für die Löschung einer Sprachnotiz
  const handleNoteDelete = async (noteId: string) => {
    console.log(`ProductList - Sprachnotiz mit ID löschen: ${noteId}`);
    await deleteNote(noteId);
    onNoteDelete(noteId);
  };

  // Handler für den Klick auf die Bearbeiten-Schaltfläche
  const handleEditClick = (id: string, name: string, isVoice: boolean) => {
    // Name vor der Anzeige im Editor bereinigen
    const cleanedName = cleanProductName(name);
    
    setCurrentEditProduct({
      id,
      productName: cleanedName,
      isVoiceNote: isVoice
    });
    setEditDialogOpen(true);
  };

  // Handler zum Speichern eines bearbeiteten Produkts
  const handleEditSave = async (data: any) => {
    console.log('Bearbeitetes Produkt speichern:', data);
    
    try {
      if (data.isVoiceNote) {
        const formattedText = `Produkt: ${data.product}`;
        await updateNote(data.id, formattedText);
      } else {
        await updateReceiptProduct(data.id, data.product);
      }
      
      onProductUpdate();
      
      toast({
        title: "Produkt aktualisiert",
        description: "Das Produkt wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Produkts:', error);
      toast({
        title: "Fehler",
        description: "Beim Aktualisieren des Produkts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  // Sprachnotizen für die Anzeige verarbeiten
  const processedNotes = notes
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(note => {
      let displayText = note.text;
      if (displayText.includes('Produkt:')) {
        displayText = displayText.split('\n')[0].replace('Produkt:', '').trim();
      }
      
      // Produktname bereinigen
      const cleanedName = cleanProductName(displayText);
      const category = categorizeFoodItem(cleanedName);
      
      return {
        id: note.id,
        name: cleanedName,
        isVoice: true,
        category
      };
    });

  // Kassenbeleg-Produkte für die Anzeige verarbeiten
  const processedReceiptProducts = receiptProducts
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(product => {
      // Produktname gründlich bereinigen
      const cleanedName = cleanProductName(product.productName);
      const category = categorizeFoodItem(cleanedName);
      
      return {
        id: product.id,
        name: cleanedName,
        isVoice: false,
        category
      };
    });

  // Produkte nach ausgewählten Kategorien filtern
  const filteredProducts = [...processedNotes, ...processedReceiptProducts].filter(item => {
    if (selectedCategories.length === 0) return true; // Alle anzeigen, wenn kein Filter angewendet wird
    return selectedCategories.includes(item.category);
  });

  // Kategorieauswahl umschalten
  const toggleCategory = (category: FoodCategory) => {
    setSelectedCategories(current => {
      if (current.includes(category)) {
        return current.filter(c => c !== category);
      } else {
        return [...current, category];
      }
    });
  };

  // Alle Filter zurücksetzen
  const clearFilters = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="space-y-4">
      {/* Kategorie-Filter */}
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
