
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FoodCategory } from '../../utils/foodCategories';

interface CategoryBadgeProps {
  category: FoodCategory;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  // Function to get category badge color based on category
  const getCategoryColor = (category: FoodCategory): string => {
    switch(category) {
      case FoodCategory.FRUECHTE:
        return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
      case FoodCategory.GEMUESE:
        return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
      case FoodCategory.FLEISCH:
        return "bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200";
      case FoodCategory.FISCH:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200";
      case FoodCategory.MILCHPRODUKTE:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
      case FoodCategory.GETREIDE:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200";
      case FoodCategory.HUELSENFRUECHTE:
        return "bg-lime-100 text-lime-800 hover:bg-lime-100 border-lime-200";
      case FoodCategory.NUESSE:
        return "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200";
      case FoodCategory.GEWUERZE:
        return "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200";
      case FoodCategory.GETRÄNKE:
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 border-cyan-200";
      case FoodCategory.SUESSIGKEITEN:
        return "bg-pink-100 text-pink-800 hover:bg-pink-100 border-pink-200";
      case FoodCategory.KONSERVEN:
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200";
      case FoodCategory.TIEFKUEHLWARE:
        return "bg-sky-100 text-sky-800 hover:bg-sky-100 border-sky-200";
      default:
        return "bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={`${getCategoryColor(category)} rounded-full px-4 py-1`}
    >
      {category}
    </Badge>
  );
};

export default CategoryBadge;
