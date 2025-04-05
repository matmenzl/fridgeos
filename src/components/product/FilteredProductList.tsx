
import React from 'react';
import { FoodCategory } from '../../utils/foodCategories';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  isVoice: boolean;
  category: FoodCategory;
  timestamp: number;
}

interface FilteredProductListProps {
  products: Product[];
  selectedCategories: FoodCategory[];
  onDeleteNote: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onEditClick: (id: string, name: string, isVoice: boolean) => void;
  clearFilters: () => void;
}

const FilteredProductList: React.FC<FilteredProductListProps> = ({
  products,
  selectedCategories,
  onDeleteNote,
  onDeleteProduct,
  onEditClick,
  clearFilters
}) => {
  // Apply category filters
  const filteredProducts = selectedCategories.length > 0
    ? products.filter(product => selectedCategories.includes(product.category))
    : products;

  // Handle delete based on product type
  const handleDelete = (id: string, isVoice: boolean) => {
    console.log(`FilteredProductList - Lösche Produkt: ${id}, isVoice: ${isVoice}`);
    if (isVoice) {
      onDeleteNote(id);
    } else {
      onDeleteProduct(id);
    }
  };

  // Check if we need to show "no results" message
  const showNoResults = filteredProducts.length === 0 && selectedCategories.length > 0;

  return (
    <div className="space-y-4">
      {/* No results message with button to clear filters */}
      {showNoResults && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Keine Produkte in den ausgewählten Kategorien gefunden.</p>
          <button 
            onClick={clearFilters}
            className="text-primary hover:underline"
          >
            Filter zurücksetzen
          </button>
        </div>
      )}
      
      {/* Products grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            isVoice={product.isVoice}
            category={product.category}
            timestamp={product.timestamp}
            onDelete={() => handleDelete(product.id, product.isVoice)}
            onEdit={onEditClick}
          />
        ))}
      </div>
    </div>
  );
};

export default FilteredProductList;
