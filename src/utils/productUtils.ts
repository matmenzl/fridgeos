
export const extractProductNames = (notes: { text: string }[]): string[] => {
  // Simple extraction based on note content
  // In a real app, this would be more sophisticated
  return notes.map(note => note.text.split(',')[0].trim());
};

// API-Schlüssel-Verwaltungsfunktionen
export const getOpenAiApiKey = (): string | null => {
  return localStorage.getItem('openai_api_key');
};

export const saveOpenAiApiKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
};

export const removeOpenAiApiKey = (): void => {
  localStorage.removeItem('openai_api_key');
};

export const generateMenuSuggestions = async (products: string[]): Promise<string[]> => {
  if (products.length === 0) return [];
  
  try {
    // Prepare the list of products as a comma-separated string
    const productsList = products.join(', ');
    
    // Create the prompt for ChatGPT
    const prompt = `Du bist ein Koch-Experte und sollst Menüvorschläge basierend auf den folgenden Zutaten erstellen:
    
    ${productsList}
    
    Bitte erstelle 6 kreative Menüvorschläge (oder weniger, wenn nicht genug Zutaten vorhanden sind). 
    Jeder Vorschlag sollte kurz sein (maximal 3-4 Wörter) und auf Deutsch.
    Gib nur die Menüvorschläge zurück, einer pro Zeile, ohne Nummerierung oder andere Texte.`;
    
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getOpenAiApiKey() || ''}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein hilfreicher Assistent, der kreative Menüvorschläge basierend auf vorhandenen Zutaten erstellt.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}`);
    }
    
    const data = await response.json();
    
    // Extract the suggestions from the API response
    const aiResponse = data.choices[0].message.content.trim();
    
    // Split the response by new lines to get individual suggestions
    const suggestions = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('-')) // Remove empty lines and bullet points
      .map(line => {
        // Remove numbers at the beginning if present (e.g. "1. Spaghetti Carbonara" -> "Spaghetti Carbonara")
        return line.replace(/^\d+\.\s*/, '');
      });
    
    // Return up to 6 suggestions
    return suggestions.slice(0, 6);
  } catch (error) {
    console.error('Fehler bei der Generierung von Menüvorschlägen:', error);
    
    // Fall back to the original implementation if the API call fails
    return fallbackMenuSuggestions(products);
  }
};

// Fallback function that uses the original implementation
const fallbackMenuSuggestions = (products: string[]): string[] => {
  const suggestions: string[] = [];
  
  // If we have at least two products
  if (products.length >= 2) {
    // Create combinations of products
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const randomProduct1 = products[Math.floor(Math.random() * products.length)];
      let randomProduct2;
      do {
        randomProduct2 = products[Math.floor(Math.random() * products.length)];
      } while (randomProduct2 === randomProduct1 && products.length > 1);
      
      suggestions.push(`${randomProduct1} mit ${randomProduct2}`);
    }
  }
  
  // If we have at least one product
  if (products.length >= 1) {
    const mealTypes = ['Auflauf', 'Salat', 'Suppe', 'Pfanne', 'Eintopf'];
    const usedMealTypes = new Set<string>();
    
    // Generate unique meal suggestions
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      let mealType;
      
      // Try to get a unique meal type
      do {
        mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
      } while (usedMealTypes.has(mealType) && usedMealTypes.size < mealTypes.length);
      
      usedMealTypes.add(mealType);
      suggestions.push(`${randomProduct}-${mealType}`);
    }
  }
  
  // Shuffle suggestions and return up to 6
  return shuffleArray(suggestions).slice(0, 6);
};

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
