
// Generate fallback menu suggestions without API
export function generateFallbackSuggestions(products: string[]): string[] {
  const suggestions: string[] = [];
  const filteredProducts = products.filter(p => p && typeof p === 'string' && p.trim().length > 1);
  
  if (filteredProducts.length === 0) {
    return [
      "Pasta mit Tomatensauce",
      "Gemüsepfanne",
      "Kartoffelauflauf",
      "Reis mit Gemüse",
      "Salat mit Brot",
      "Pfannkuchen"
    ];
  }
  
  // Create combinations of products
  const mealTypes = ['Auflauf', 'Salat', 'Suppe', 'Pfanne', 'Eintopf', 'mit Sauce'];
  
  // Generate unique meal type suggestions
  for (let i = 0; i < Math.min(6, filteredProducts.length * mealTypes.length); i++) {
    const randomProduct = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
    const mealType = mealTypes[i % mealTypes.length];
    
    let suggestion = `${randomProduct}-${mealType}`;
    
    if (suggestions.includes(suggestion)) {
      // Try another combination
      const anotherProduct = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      suggestion = `${anotherProduct} ${mealType}`;
    }
    
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
      if (suggestions.length >= 6) break;
    }
  }
  
  // If we still need more suggestions
  while (suggestions.length < 6) {
    if (filteredProducts.length >= 2) {
      const randomProduct1 = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      const randomProduct2 = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      const suggestion = `${randomProduct1} mit ${randomProduct2}`;
      
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    } else {
      const basicMeals = ['Pasta', 'Salat', 'Suppe', 'Pfannkuchen', 'Auflauf', 'Eintopf'];
      const randomMeal = basicMeals[Math.floor(Math.random() * basicMeals.length)];
      
      if (filteredProducts.length > 0) {
        const randomProduct = filteredProducts[0];
        const suggestion = `${randomMeal} mit ${randomProduct}`;
        
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      } else {
        suggestions.push(randomMeal);
      }
    }
  }
  
  return suggestions.slice(0, 6);
}

// Helper function to shuffle an array
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
