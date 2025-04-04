
import React from 'react';
import { AlertCircle, LoaderCircle } from "lucide-react";
import MenuSuggestionCard from './MenuSuggestionCard';

interface MenuSuggestionsListProps {
  menuSuggestions: string[];
  suggestionImages: string[];
  isLoading: boolean;
  onGetRecipe: (suggestion: string) => void;
}

const MenuSuggestionsList: React.FC<MenuSuggestionsListProps> = ({
  menuSuggestions,
  suggestionImages,
  isLoading,
  onGetRecipe
}) => {
  if (menuSuggestions.length === 0) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <LoaderCircle size={32} className="animate-spin text-primary" />
            <p className="text-muted-foreground">Generiere Menüvorschläge...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <AlertCircle size={24} className="text-muted-foreground" />
            <p className="text-muted-foreground">
              Keine Menüvorschläge verfügbar. Klicke auf "Neu generieren", um Vorschläge zu erhalten.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {menuSuggestions.map((suggestion, index) => (
        <MenuSuggestionCard 
          key={index}
          suggestion={suggestion}
          image={suggestionImages[index]}
          onGetRecipe={onGetRecipe}
        />
      ))}
    </div>
  );
};

export default MenuSuggestionsList;
