
import React from "react";
import SuggestionCard from "./SuggestionCard";

interface SuggestionGridProps {
  suggestions: string[];
  suggestionImages: string[];
  onGetRecipe: (suggestion: string) => void;
}

const SuggestionGrid: React.FC<SuggestionGridProps> = ({ 
  suggestions, 
  suggestionImages, 
  onGetRecipe 
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      {suggestions.map((suggestion, index) => (
        <SuggestionCard
          key={index}
          suggestion={suggestion}
          imageUrl={suggestionImages[index]}
          onGetRecipe={onGetRecipe}
        />
      ))}
    </div>
  );
};

export default SuggestionGrid;
