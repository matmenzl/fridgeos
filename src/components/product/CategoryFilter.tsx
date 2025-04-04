
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FoodCategory, getAllFoodCategories } from '../../utils/foodCategories';

interface CategoryFilterProps {
  selectedCategories: FoodCategory[];
  toggleCategory: (category: FoodCategory) => void;
  clearFilters: () => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  toggleCategory,
  clearFilters
}) => {
  const allCategories = getAllFoodCategories();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Filter nach Kategorie:</span>
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(category => (
              <Badge 
                key={category} 
                className="px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" 
                onClick={() => toggleCategory(category)}
              >
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
  );
};

export default CategoryFilter;
