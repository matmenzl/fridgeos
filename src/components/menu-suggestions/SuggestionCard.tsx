
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, ImageIcon } from "lucide-react";
import { SuggestionCardProps } from "./types";

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, imageUrl, onGetRecipe }) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 bg-muted">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`Bild für ${suggestion}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=500";
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="text-muted-foreground" size={32} />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <p className="text-center font-medium">{suggestion}</p>
        <div className="flex justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGetRecipe(suggestion)}
            className="flex items-center gap-1"
          >
            <Book size={16} />
            <span>Rezept anzeigen</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionCard;
