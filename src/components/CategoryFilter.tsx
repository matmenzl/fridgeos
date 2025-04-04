
import React from 'react';
import { Button } from '@/components/ui/button';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="flex overflow-x-auto gap-2 py-2 px-1 bg-gray-50 rounded-lg">
      <Button
        variant={selectedCategory === 'All' ? 'default' : 'ghost'}
        className={`rounded-md ${selectedCategory === 'All' ? 'bg-white shadow text-black' : 'hover:bg-white'}`}
        onClick={() => onSelectCategory('All')}
      >
        All
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'ghost'}
          className={`rounded-md whitespace-nowrap ${selectedCategory === category ? 'bg-white shadow text-black' : 'hover:bg-white'}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
