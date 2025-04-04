
// Predefined food categories in German
export enum FoodCategory {
  FRUECHTE = 'Früchte',
  GEMUESE = 'Gemüse',
  FLEISCH = 'Fleisch',
  FISCH = 'Fisch',
  MILCHPRODUKTE = 'Milchprodukte',
  GETREIDE = 'Getreide & Backwaren',
  HUELSENFRUECHTE = 'Hülsenfrüchte',
  NUESSE = 'Nüsse & Samen',
  GEWUERZE = 'Gewürze',
  GETRÄNKE = 'Getränke',
  SUESSIGKEITEN = 'Süßigkeiten',
  KONSERVEN = 'Konserven',
  TIEFKUEHLWARE = 'Tiefkühlware',
  SONSTIGES = 'Sonstiges'
}

// Dictionary mapping food items to categories
const foodCategoryMap: Record<string, FoodCategory> = {
  // Früchte
  'apfel': FoodCategory.FRUECHTE,
  'äpfel': FoodCategory.FRUECHTE,
  'banane': FoodCategory.FRUECHTE,
  'bananen': FoodCategory.FRUECHTE,
  'orange': FoodCategory.FRUECHTE,
  'orangen': FoodCategory.FRUECHTE,
  'erdbeere': FoodCategory.FRUECHTE,
  'erdbeeren': FoodCategory.FRUECHTE,
  'kiwi': FoodCategory.FRUECHTE,
  'birne': FoodCategory.FRUECHTE,
  'birnen': FoodCategory.FRUECHTE,
  'zitrone': FoodCategory.FRUECHTE,
  'zitronen': FoodCategory.FRUECHTE,
  'traube': FoodCategory.FRUECHTE,
  'trauben': FoodCategory.FRUECHTE,
  'pfirsich': FoodCategory.FRUECHTE,
  'pfirsiche': FoodCategory.FRUECHTE,
  'ananas': FoodCategory.FRUECHTE,
  'melone': FoodCategory.FRUECHTE,
  'melonen': FoodCategory.FRUECHTE,
  'beere': FoodCategory.FRUECHTE,
  'beeren': FoodCategory.FRUECHTE,
  'obst': FoodCategory.FRUECHTE,
  
  // Gemüse
  'tomate': FoodCategory.GEMUESE,
  'tomaten': FoodCategory.GEMUESE,
  'gurke': FoodCategory.GEMUESE,
  'gurken': FoodCategory.GEMUESE,
  'karotte': FoodCategory.GEMUESE,
  'karotten': FoodCategory.GEMUESE,
  'möhre': FoodCategory.GEMUESE,
  'möhren': FoodCategory.GEMUESE,
  'kartoffel': FoodCategory.GEMUESE,
  'kartoffeln': FoodCategory.GEMUESE,
  'zwiebel': FoodCategory.GEMUESE,
  'zwiebeln': FoodCategory.GEMUESE,
  'paprika': FoodCategory.GEMUESE,
  'salat': FoodCategory.GEMUESE,
  'spinat': FoodCategory.GEMUESE,
  'brokkoli': FoodCategory.GEMUESE,
  'blumenkohl': FoodCategory.GEMUESE,
  'zucchini': FoodCategory.GEMUESE,
  'aubergine': FoodCategory.GEMUESE,
  'auberginen': FoodCategory.GEMUESE,
  'lauch': FoodCategory.GEMUESE,
  'kohl': FoodCategory.GEMUESE,
  'gemüse': FoodCategory.GEMUESE,
  
  // Fleisch
  'rind': FoodCategory.FLEISCH,
  'rindfleisch': FoodCategory.FLEISCH,
  'schwein': FoodCategory.FLEISCH,
  'schweinefleisch': FoodCategory.FLEISCH,
  'huhn': FoodCategory.FLEISCH,
  'hähnchen': FoodCategory.FLEISCH,
  'hühnchen': FoodCategory.FLEISCH,
  'pute': FoodCategory.FLEISCH,
  'putenfleisch': FoodCategory.FLEISCH,
  'truthahn': FoodCategory.FLEISCH,
  'lamm': FoodCategory.FLEISCH,
  'lammfleisch': FoodCategory.FLEISCH,
  'wurst': FoodCategory.FLEISCH,
  'würstchen': FoodCategory.FLEISCH,
  'schinken': FoodCategory.FLEISCH,
  'speck': FoodCategory.FLEISCH,
  'fleisch': FoodCategory.FLEISCH,
  'steak': FoodCategory.FLEISCH,
  'hackfleisch': FoodCategory.FLEISCH,
  'hack': FoodCategory.FLEISCH,
  
  // Fisch
  'lachs': FoodCategory.FISCH,
  'forelle': FoodCategory.FISCH,
  'thunfisch': FoodCategory.FISCH,
  'kabeljau': FoodCategory.FISCH,
  'dorsch': FoodCategory.FISCH,
  'fisch': FoodCategory.FISCH,
  'hering': FoodCategory.FISCH,
  'garnele': FoodCategory.FISCH,
  'garnelen': FoodCategory.FISCH,
  'shrimp': FoodCategory.FISCH,
  'shrimps': FoodCategory.FISCH,
  'krabben': FoodCategory.FISCH,
  'meeresfrüchte': FoodCategory.FISCH,
  
  // Milchprodukte
  'milch': FoodCategory.MILCHPRODUKTE,
  'käse': FoodCategory.MILCHPRODUKTE,
  'joghurt': FoodCategory.MILCHPRODUKTE,
  'jogurt': FoodCategory.MILCHPRODUKTE,
  'quark': FoodCategory.MILCHPRODUKTE,
  'sahne': FoodCategory.MILCHPRODUKTE,
  'butter': FoodCategory.MILCHPRODUKTE,
  'margarine': FoodCategory.MILCHPRODUKTE,
  'frischkäse': FoodCategory.MILCHPRODUKTE,
  'schmand': FoodCategory.MILCHPRODUKTE,
  'sauerrahm': FoodCategory.MILCHPRODUKTE,
  'schlagsahne': FoodCategory.MILCHPRODUKTE,
  
  // Getreide & Backwaren
  'brot': FoodCategory.GETREIDE,
  'brötchen': FoodCategory.GETREIDE,
  'breze': FoodCategory.GETREIDE,
  'brezel': FoodCategory.GETREIDE,
  'toast': FoodCategory.GETREIDE,
  'toastbrot': FoodCategory.GETREIDE,
  'reis': FoodCategory.GETREIDE,
  'nudel': FoodCategory.GETREIDE,
  'nudeln': FoodCategory.GETREIDE,
  'pasta': FoodCategory.GETREIDE,
  'spaghetti': FoodCategory.GETREIDE,
  'mehl': FoodCategory.GETREIDE,
  'haferflocken': FoodCategory.GETREIDE,
  'hafer': FoodCategory.GETREIDE,
  'müsli': FoodCategory.GETREIDE,
  'cornflakes': FoodCategory.GETREIDE,
  'getreide': FoodCategory.GETREIDE,
  
  // Hülsenfrüchte
  'bohne': FoodCategory.HUELSENFRUECHTE,
  'bohnen': FoodCategory.HUELSENFRUECHTE,
  'linse': FoodCategory.HUELSENFRUECHTE,
  'linsen': FoodCategory.HUELSENFRUECHTE,
  'kichererbse': FoodCategory.HUELSENFRUECHTE,
  'kichererbsen': FoodCategory.HUELSENFRUECHTE,
  'erbse': FoodCategory.HUELSENFRUECHTE,
  'erbsen': FoodCategory.HUELSENFRUECHTE,
  'hülsenfrucht': FoodCategory.HUELSENFRUECHTE,
  'hülsenfrüchte': FoodCategory.HUELSENFRUECHTE,
  
  // Nüsse & Samen
  'nuss': FoodCategory.NUESSE,
  'nüsse': FoodCategory.NUESSE,
  'mandel': FoodCategory.NUESSE,
  'mandeln': FoodCategory.NUESSE,
  'walnuss': FoodCategory.NUESSE,
  'walnüsse': FoodCategory.NUESSE,
  'haselnuss': FoodCategory.NUESSE,
  'haselnüsse': FoodCategory.NUESSE,
  'erdnuss': FoodCategory.NUESSE,
  'erdnüsse': FoodCategory.NUESSE,
  'samen': FoodCategory.NUESSE,
  'chia': FoodCategory.NUESSE,
  'chiasamen': FoodCategory.NUESSE,
  'leinsamen': FoodCategory.NUESSE,
  'sonnenblumenkerne': FoodCategory.NUESSE,
  'kürbiskerne': FoodCategory.NUESSE,
  
  // Gewürze
  'salz': FoodCategory.GEWUERZE,
  'pfeffer': FoodCategory.GEWUERZE,
  'zucker': FoodCategory.GEWUERZE,
  'gewürz': FoodCategory.GEWUERZE,
  'gewürze': FoodCategory.GEWUERZE,
  'basilikum': FoodCategory.GEWUERZE,
  'oregano': FoodCategory.GEWUERZE,
  'thymian': FoodCategory.GEWUERZE,
  'rosmarin': FoodCategory.GEWUERZE,
  'zimt': FoodCategory.GEWUERZE,
  'vanille': FoodCategory.GEWUERZE,
  'curry': FoodCategory.GEWUERZE,
  'paprikapulver': FoodCategory.GEWUERZE,
  
  // Getränke
  'wasser': FoodCategory.GETRÄNKE,
  'saft': FoodCategory.GETRÄNKE,
  'limonade': FoodCategory.GETRÄNKE,
  'cola': FoodCategory.GETRÄNKE,
  'bier': FoodCategory.GETRÄNKE,
  'wein': FoodCategory.GETRÄNKE,
  'kaffee': FoodCategory.GETRÄNKE,
  'tee': FoodCategory.GETRÄNKE,
  'milch': FoodCategory.GETRÄNKE,
  'getränk': FoodCategory.GETRÄNKE,
  'getränke': FoodCategory.GETRÄNKE,
  
  // Süßigkeiten
  'schokolade': FoodCategory.SUESSIGKEITEN,
  'bonbon': FoodCategory.SUESSIGKEITEN,
  'bonbons': FoodCategory.SUESSIGKEITEN,
  'kuchen': FoodCategory.SUESSIGKEITEN,
  'kekse': FoodCategory.SUESSIGKEITEN,
  'cookies': FoodCategory.SUESSIGKEITEN,
  'süßigkeit': FoodCategory.SUESSIGKEITEN,
  'süßigkeiten': FoodCategory.SUESSIGKEITEN,
  'eis': FoodCategory.SUESSIGKEITEN,
  'pudding': FoodCategory.SUESSIGKEITEN,
  
  // Konserven
  'konserve': FoodCategory.KONSERVEN,
  'konserven': FoodCategory.KONSERVEN,
  'dose': FoodCategory.KONSERVEN,
  'dosen': FoodCategory.KONSERVEN,
  
  // Tiefkühlware
  'tiefkühl': FoodCategory.TIEFKUEHLWARE,
  'tiefgekühlt': FoodCategory.TIEFKUEHLWARE,
  'tiefkühlware': FoodCategory.TIEFKUEHLWARE,
  'gefroren': FoodCategory.TIEFKUEHLWARE
};

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
