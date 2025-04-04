
import { FoodCategory } from './types';
import { foodCategoryMap } from './categoryMaps';

/**
 * Determines the food category for a given product name
 * @param productName The name of the food product
 * @returns The category of the food product or Sonstiges if unknown
 */
export const categorizeFoodItem = (productName: string): FoodCategory => {
  if (!productName) return FoodCategory.SONSTIGES;

  // Convert to lowercase for case-insensitive matching
  const normalizedName = productName.toLowerCase().trim();
  
  // Try to find exact match first
  if (foodCategoryMap[normalizedName]) {
    return foodCategoryMap[normalizedName];
  }
  
  // If no exact match, check if the product name contains any known food item
  for (const [keyword, category] of Object.entries(foodCategoryMap)) {
    if (normalizedName.includes(keyword)) {
      return category;
    }
  }
  
  // Default category if no match found
  return FoodCategory.SONSTIGES;
};

/**
 * Gets all available food categories
 * @returns Array of all food categories
 */
export const getAllFoodCategories = (): FoodCategory[] => {
  return Object.values(FoodCategory);
};

// Re-export the FoodCategory enum
export { FoodCategory } from './types';
