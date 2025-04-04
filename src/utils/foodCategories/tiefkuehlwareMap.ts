
import { FoodCategory } from './types';

// Map for Tiefkühlware (frozen foods)
export const tiefkuehlwareMap: Record<string, FoodCategory> = {
  'tiefkühl': FoodCategory.TIEFKUEHLWARE,
  'tiefgekühlt': FoodCategory.TIEFKUEHLWARE,
  'tiefkühlware': FoodCategory.TIEFKUEHLWARE,
  'gefroren': FoodCategory.TIEFKUEHLWARE
};
