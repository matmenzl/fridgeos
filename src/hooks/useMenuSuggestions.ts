
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
      
      // Generate suggestions based on combined products using API
      const newSuggestions = await generateMenuSuggestions(allProducts);
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
      const recipeText = await getRecipeForSuggestion(suggestion);
      setRecipe(recipeText);
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
      const { data, error } = await supabase.functions.invoke('menu-suggestions', {
        body: { action: 'ping' },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return !error;
    } catch (error) {
      console.error('Supabase Edge-Funktion nicht verfügbar:', error);
      return false;
    }
  };

  useEffect(() => {
    const generateSuggestions = async () => {
      if (notes.length > 0 || receiptProducts.length > 0) {
        await regenerateSuggestions();
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
