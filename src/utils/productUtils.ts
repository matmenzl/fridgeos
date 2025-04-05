
import { supabase } from '../integrations/supabase/client';

export const extractProductNames = (notes: { text: string }[]): string[] => {
  // Simple extraction based on note content
  // In a real app, this would be more sophisticated
  return notes.map(note => note.text.split(',')[0].trim());
};

// API-Schlüssel-Verwaltungsfunktionen
// Diese bleiben für die Abwärtskompatibilität erhalten
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
    console.log(`Generiere Menüvorschläge für: ${JSON.stringify(products)}`);
    console.log(`Rufe Edge-Funktion "menu-suggestions" mit diesen Produkten auf: ${JSON.stringify(products)}`);
    
    // Rufe die Edge-Funktion auf mit klarem Aktionsparameter
    const { data, error } = await supabase.functions.invoke('menu-suggestions', {
      body: { products, action: 'getMenuSuggestions' }
    });
    
    console.log("Menu API Antwort:", { data, error });
    
    if (error) {
      console.error('Fehler bei der Generierung von Menüvorschlägen:', error);
      throw error;
    }
    
    if (data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      return data.suggestions;
    }
    
    console.log("Keine gültigen Vorschläge erhalten, verwende Fallback");
    // Fallback auf die originale Implementierung, wenn die API keinen Erfolg hatte
    return fallbackMenuSuggestions(products);
  } catch (error) {
    console.error('Fehler bei der Generierung von Menüvorschlägen:', error);
    
    // Fallback auf die originale Implementierung bei einem Fehler
    return fallbackMenuSuggestions(products);
  }
};

// Neue Funktion zum Abrufen eines Rezepts für einen Menüvorschlag
export const getRecipeForSuggestion = async (suggestion: string): Promise<string> => {
  try {
    console.log(`Hole Rezept für: ${suggestion}`);
    
    // Rufe die Edge-Funktion auf mit klarem Aktionsparameter
    console.log(`Rufe Edge-Funktion "menu-suggestions" für Rezept auf: ${suggestion}`);
    const { data, error } = await supabase.functions.invoke('menu-suggestions', {
      body: { products: suggestion, action: 'getRecipe' }
    });
    
    console.log("Rezept API Antwort:", { data, error });
    
    if (error) {
      console.error('Fehler bei der Generierung des Rezepts:', error);
      throw error;
    }
    
    if (data?.recipe && typeof data.recipe === 'string') {
      return data.recipe;
    }
    
    // Wenn nur Status zurückkommt ohne Rezept, versuche es erneut mit klarerem Aktionsparameter
    if (data?.status === "ok" && !data.recipe) {
      console.log("Ungültige Antwort erhalten: Nur Status-OK ohne Rezept");
      console.log("Versuche erneuten Aufruf mit klarerem Aktionsparameter");
      
      // Zweiter Versuch mit noch deutlicherem Aktionsparameter
      const retryResponse = await supabase.functions.invoke('menu-suggestions', {
        body: { 
          products: suggestion, 
          action: 'getRecipe',
          requestType: 'recipeFetch'
        }
      });
      
      console.log("Retry response:", retryResponse);
      
      if (retryResponse.data?.recipe && typeof retryResponse.data.recipe === 'string') {
        return retryResponse.data.recipe;
      }
      
      throw new Error('Rezept konnte nicht generiert werden');
    }
    
    throw new Error('Rezept konnte nicht generiert werden');
  } catch (error) {
    console.error('Fehler bei der Generierung des Rezepts:', error);
    return 'Rezept konnte nicht geladen werden. Bitte versuche es später erneut.';
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
