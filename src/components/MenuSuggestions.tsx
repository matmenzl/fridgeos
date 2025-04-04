
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Refrigerator, Wifi, Shuffle, LoaderCircle } from "lucide-react";
import { extractProductNames, generateMenuSuggestions, getRecipeForSuggestion } from '../utils/productUtils';
import { Note, ProductNote } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../integrations/supabase/client";
import ApiKeyDialog from './menu-suggestions/ApiKeyDialog';
import RecipeDialog from './menu-suggestions/RecipeDialog';
import MenuSuggestionsList from './menu-suggestions/MenuSuggestionsList';

interface MenuSuggestionsProps {
  notes: Note[];
  receiptProducts?: ProductNote[];
}

// Array of food images from Unsplash (public image database)
const foodImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=500",
];

const MenuSuggestions: React.FC<MenuSuggestionsProps> = ({ notes, receiptProducts = [] }) => {
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
    } finally {
      setIsLoadingRecipe(false);
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
  
  // Only show menu suggestions if we have products (either from notes or receipt products)
  const hasProducts = notes.length > 0 || receiptProducts.length > 0;
  
  if (!hasProducts) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <div className="flex text-green-500">
            <Refrigerator size={24} />
            <Wifi size={16} className="relative -ml-1 -mt-1" />
          </div>
          <span>Menüvorschläge</span>
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={regenerateSuggestions}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              <span>Generiere...</span>
            </>
          ) : (
            <>
              <Shuffle size={16} />
              <span>Neu generieren</span>
            </>
          )}
        </Button>
      </div>
      
      <MenuSuggestionsList 
        menuSuggestions={menuSuggestions}
        suggestionImages={suggestionImages}
        isLoading={isLoading}
        onGetRecipe={handleGetRecipe}
      />
      
      <ApiKeyDialog
        open={apiKeyDialogOpen}
        onOpenChange={setApiKeyDialogOpen}
      />
      
      <RecipeDialog
        open={recipeDialogOpen}
        onOpenChange={setRecipeDialogOpen}
        selectedSuggestion={selectedSuggestion}
        recipe={recipe}
        isLoading={isLoadingRecipe}
      />
    </div>
  );
};

export default MenuSuggestions;
