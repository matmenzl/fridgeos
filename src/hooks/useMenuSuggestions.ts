
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { extractProductNames, generateMenuSuggestions, getRecipeForSuggestion } from "../utils/productUtils";
import { foodImages } from "../components/menu-suggestions/types";
import { supabase } from "../integrations/supabase/client";

export const useMenuSuggestions = (notes: any[], receiptProducts: any[] = []) => {
  const [menuSuggestions, setMenuSuggestions] = useState<string[]>([]);
  const [suggestionImages, setSuggestionImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string>('');
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const { toast } = useToast();

  const regenerateSuggestions = async () => {
    setIsLoading(true);
    
    try {
      // Extract products from notes
      const notesProducts = extractProductNames(notes);
      
      // Extract products from receipt products
      const receiptProductNames = receiptProducts.map(product => product.productName);
      
      // Combine both product lists
      const allProducts = [...notesProducts, ...receiptProductNames];
      
      console.log('Generiere Menüvorschläge für:', allProducts);
      
      // Generate suggestions based on combined products using API
      const newSuggestions = await generateMenuSuggestions(allProducts);
      
      if (newSuggestions && newSuggestions.length > 0) {
        setMenuSuggestions(newSuggestions);
        
        // Assign random images from our collection to each suggestion
        const newImages = newSuggestions.map(() => {
          const randomIndex = Math.floor(Math.random() * foodImages.length);
          return foodImages[randomIndex];
        });
        setSuggestionImages(newImages);
        
        toast({
          title: "Menüvorschläge wurden generiert",
          description: "Neue Vorschläge wurden erfolgreich erstellt.",
        });
      } else {
        console.error('Keine Vorschläge erhalten');
        toast({
          title: "Hinweis",
          description: "Es konnten keine Menüvorschläge generiert werden. Bitte versuche es später erneut.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Fehler bei der Generierung von Menüvorschlägen:', error);
      toast({
        title: "Fehler",
        description: "Menüvorschläge konnten nicht generiert werden. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetRecipe = async (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setIsLoadingRecipe(true);
    setRecipeDialogOpen(true);
    
    try {
      console.log('Hole Rezept für:', suggestion);
      const recipeText = await getRecipeForSuggestion(suggestion);
      
      if (recipeText && recipeText.length > 0) {
        setRecipe(recipeText);
      } else {
        setRecipe('Rezept konnte nicht geladen werden. Bitte versuche es später erneut.');
        toast({
          title: "Hinweis",
          description: "Das Rezept konnte nicht geladen werden.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden des Rezepts:', error);
      setRecipe('Rezept konnte nicht geladen werden. Bitte versuche es später erneut.');
      
      toast({
        title: "Fehler beim Laden des Rezepts",
        description: "Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  // Check if the Edge function is available
  const checkSupabaseFunction = async () => {
    try {
      console.log('Überprüfe, ob die Edge-Funktion verfügbar ist');
      
      const response = await supabase.functions.invoke('menu-suggestions', {
        body: { action: 'ping' },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.error) {
        console.error('Edge-Funktion nicht verfügbar:', response.error);
        return false;
      }
      
      console.log('Edge-Funktion ist verfügbar:', response.data);
      return true;
    } catch (error) {
      console.error('Supabase Edge-Funktion nicht verfügbar:', error);
      return false;
    }
  };

  useEffect(() => {
    const generateSuggestions = async () => {
      if (notes.length > 0 || receiptProducts.length > 0) {
        try {
          // Check if the Edge function is available
          const isFunctionAvailable = await checkSupabaseFunction();
          
          if (isFunctionAvailable) {
            console.log('Edge-Funktion ist verfügbar, generiere Menüvorschläge');
            await regenerateSuggestions();
          } else {
            console.log('Edge-Funktion ist nicht verfügbar, verwende Fallback');
            // We'll still try to generate suggestions, the productUtils will handle the fallback
            await regenerateSuggestions();
          }
        } catch (error) {
          console.error('Fehler beim Prüfen der Edge-Funktion:', error);
          // Try regenerating suggestions anyway, the fallback should handle failures
          await regenerateSuggestions();
        }
      }
    };
    
    generateSuggestions();
  }, [notes, receiptProducts]);

  return {
    menuSuggestions,
    suggestionImages,
    isLoading,
    apiKeyDialogOpen,
    setApiKeyDialogOpen,
    selectedSuggestion,
    recipe,
    isLoadingRecipe,
    recipeDialogOpen,
    setRecipeDialogOpen,
    regenerateSuggestions,
    handleGetRecipe
  };
};
