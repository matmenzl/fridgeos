
import { FoodCategory } from './foodCategories';

// Local storage key for category expiration data
export const CATEGORY_EXPIRY_KEY = 'category-expiry-settings';

interface CategoryExpiry {
  category: FoodCategory;
  daysValid: number;
}

// Get the default days valid for a category
export const getDefaultDaysForCategory = (category: FoodCategory): number => {
  switch(category) {
    case FoodCategory.FRUECHTE:
      return 7;
    case FoodCategory.GEMUESE:
      return 10;
    case FoodCategory.FLEISCH:
      return 3;
    case FoodCategory.FISCH:
      return 2;
    case FoodCategory.MILCHPRODUKTE:
      return 7;
    default:
      return 30; // Default for other categories
  }
};

// Get days valid for a specific category from stored settings
export const getDaysValidForCategory = (category: FoodCategory): number => {
  try {
    const storedData = localStorage.getItem(CATEGORY_EXPIRY_KEY);
    if (storedData) {
      const categorySettings: CategoryExpiry[] = JSON.parse(storedData);
      const categorySetting = categorySettings.find(item => item.category === category);
      if (categorySetting) {
        return categorySetting.daysValid;
      }
    }
    // Fall back to default if no stored settings
    return getDefaultDaysForCategory(category);
  } catch (error) {
    console.error('Error getting category expiry days:', error);
    return getDefaultDaysForCategory(category);
  }
};

// Calculate expiry date based on creation timestamp and category
export const calculateExpiryDate = (
  timestamp: number,
  category: FoodCategory
): Date => {
  const daysValid = getDaysValidForCategory(category);
  const creationDate = new Date(timestamp);
  const expiryDate = new Date(creationDate);
  expiryDate.setDate(creationDate.getDate() + daysValid);
  return expiryDate;
};

// Calculate days remaining until expiry
export const calculateDaysRemaining = (
  timestamp: number,
  category: FoodCategory
): number => {
  const expiryDate = calculateExpiryDate(timestamp, category);
  const today = new Date();
  
  // Reset time part to ensure we're just comparing dates
  today.setHours(0, 0, 0, 0);
  const expiryDateAdjusted = new Date(expiryDate);
  expiryDateAdjusted.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDateAdjusted.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Get expiry status with text and color code
export const getExpiryStatus = (
  timestamp: number,
  category: FoodCategory
): { text: string; color: string } => {
  const daysRemaining = calculateDaysRemaining(timestamp, category);
  
  if (daysRemaining < 0) {
    return { 
      text: `Abgelaufen seit ${Math.abs(daysRemaining)} Tagen`, 
      color: 'text-red-600 bg-red-100'
    };
  }
  
  if (daysRemaining === 0) {
    return { 
      text: 'Heute abgelaufen', 
      color: 'text-orange-600 bg-orange-100'
    };
  }
  
  if (daysRemaining <= 2) {
    return { 
      text: `Läuft in ${daysRemaining} Tagen ab`, 
      color: 'text-orange-600 bg-orange-100'
    };
  }
  
  if (daysRemaining <= 7) {
    return { 
      text: `Läuft in ${daysRemaining} Tagen ab`, 
      color: 'text-yellow-600 bg-yellow-100'
    };
  }
  
  return { 
    text: `Haltbar für ${daysRemaining} Tage`, 
    color: 'text-green-600 bg-green-100'
  };
};
