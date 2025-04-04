
import React from 'react';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import { FoodCategory } from '../../utils/foodCategories';

interface FilteredProductListProps {
  products: Array<{
    id: string;
    name: string;
    isVoice: boolean;
    category: FoodCategory;
  }>;
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
  // Filter products based on selected categories
  const filteredProducts = products.filter(item => {
    if (selectedCategories.length === 0) return true; // Show all when no filters are applied
    return selectedCategories.includes(item.category);
  });

  if (filteredProducts.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-4">
      {filteredProducts.map(item => (
        <ProductCard
          key={item.id}
          id={item.id}
          name={item.name}
          isVoice={item.isVoice}
          category={item.category}
          onDelete={item.isVoice ? onDeleteNote : onDeleteProduct}
          onEdit={onEditClick}
        />
      ))}
    </div>
  );
};

export default FilteredProductList;
