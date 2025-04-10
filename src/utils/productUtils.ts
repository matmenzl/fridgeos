
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
    
    // Rufe die Edge-Funktion mit klarem Aktionsparameter auf
    const response = await supabase.functions.invoke('menu-suggestions', {
      body: { 
        products, 
        action: 'getMenuSuggestions' 
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Menu API Antwort:", response);
    
    // Fehlerbehandlung: Wenn response.error existiert
    if (!response.data && response.error) {
      console.error('Fehler bei der Generierung von Menüvorschlägen:', response.error);
      return fallbackMenuSuggestions(products);
    }
    
    // Datenvalidierung: Prüfe, ob die Antwort gültige Vorschläge enthält
    if (response.data?.suggestions && Array.isArray(response.data.suggestions)) {
      console.log("Erhaltene Vorschläge:", response.data.suggestions);
      return response.data.suggestions;
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
    
    // First attempt with explicit action parameter
    const response = await supabase.functions.invoke('menu-suggestions', {
      body: { 
        products: suggestion, 
        action: 'getRecipe' 
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Rezept API Antwort:", response);
    
    // Fehlerbehandlung: Wenn response.error existiert
    if (response.error) {
      console.error('Fehler bei der Generierung des Rezepts:', response.error);
      return `Rezept konnte nicht geladen werden. Bitte versuche es später erneut.`;
    }
    
    // Wenn wir das Rezept erhalten haben, geben wir es zurück
    if (response.data?.recipe && typeof response.data.recipe === 'string') {
      console.log("Rezept erhalten mit Länge:", response.data.recipe.length);
      return response.data.recipe;
    }
    
    // Wenn die Antwort kein Rezept enthält, versuchen wir es mit einem zweiten Aufruf
    // Dies ist für den Fall, dass die Edge-Funktion nicht richtig auf den ersten Aufruf reagiert hat
    console.log("Keine gültigen Rezeptdaten erhalten, versuche erneuten Aufruf mit retryAttempt=true");
    
    const retryResponse = await supabase.functions.invoke('menu-suggestions', {
      body: { 
        products: suggestion, 
        action: 'getRecipe',
        retryAttempt: true
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Retry Rezept API Antwort:", retryResponse);
    
    // Prüfe, ob der zweite Versuch erfolgreich war
    if (retryResponse.data?.recipe && typeof retryResponse.data.recipe === 'string') {
      console.log("Rezept im zweiten Versuch erhalten mit Länge:", retryResponse.data.recipe.length);
      return retryResponse.data.recipe;
    }
    
    // Wenn wir einen API-Fehler bekommen haben
    if (response.data?.error || retryResponse.data?.error) {
      const errorMsg = response.data?.error || retryResponse.data?.error;
      console.error("API Fehler erhalten:", errorMsg);
      return `Rezept konnte nicht generiert werden. ${errorMsg}`;
    }
    
    // Wenn die Antwort nicht das erwartete Format hat
    console.error("Ungültige oder unvollständige Antwort erhalten:", response.data || retryResponse.data);
    return `Rezept konnte nicht generiert werden. Die API lieferte keine gültigen Daten.`;
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
