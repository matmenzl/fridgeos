
export const extractProductNames = (notes: { text: string }[]): string[] => {
  // Simple extraction based on note content
  // In a real app, this would be more sophisticated
  return notes.map(note => note.text.split(',')[0].trim());
};

export const generateMenuSuggestions = (products: string[]): string[] => {
  if (products.length === 0) return [];
  
  // Simple menu generation logic based on available products
  const suggestions: string[] = [];
  
  // If we have at least two products
  if (products.length >= 2) {
    const randomProduct1 = products[Math.floor(Math.random() * products.length)];
    let randomProduct2;
    do {
      randomProduct2 = products[Math.floor(Math.random() * products.length)];
    } while (randomProduct2 === randomProduct1 && products.length > 1);
    
    suggestions.push(`${randomProduct1} mit ${randomProduct2}`);
  }
  
  // If we have at least one product
  if (products.length >= 1) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    suggestions.push(`${randomProduct}-Auflauf`);
    suggestions.push(`${randomProduct}-Salat`);
  }
  
  return suggestions;
};
