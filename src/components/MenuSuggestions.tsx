
import React from 'react';
import { Button } from "@/components/ui/button";
import { Refrigerator, Wifi, LoaderCircle, Shuffle } from "lucide-react";
import { useMenuSuggestions } from '../hooks/useMenuSuggestions';
import { MenuSuggestionsProps } from './menu-suggestions/types';
import SuggestionGrid from './menu-suggestions/SuggestionGrid';
import EmptySuggestions from './menu-suggestions/EmptySuggestions';
import RecipeDialog from './menu-suggestions/RecipeDialog';
import ApiKeyDialog from './menu-suggestions/ApiKeyDialog';

const MenuSuggestions: React.FC<MenuSuggestionsProps> = ({ notes, receiptProducts = [] }) => {
  const {
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
  } = useMenuSuggestions(notes, receiptProducts);
  
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
      
      {menuSuggestions.length > 0 ? (
        <SuggestionGrid 
          suggestions={menuSuggestions} 
          suggestionImages={suggestionImages}
          onGetRecipe={handleGetRecipe}
        />
      ) : (
        <EmptySuggestions isLoading={isLoading} />
      )}
      
      {/* Dialogs */}
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
