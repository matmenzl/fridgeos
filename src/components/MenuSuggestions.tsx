
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { extractProductNames, generateMenuSuggestions } from '../utils/productUtils';
import { Note } from '../services/noteStorage';

interface MenuSuggestionsProps {
  notes: Note[];
}

const MenuSuggestions: React.FC<MenuSuggestionsProps> = ({ notes }) => {
  const [menuSuggestions, setMenuSuggestions] = useState<string[]>([]);
  
  const regenerateSuggestions = () => {
    const products = extractProductNames(notes);
    const newSuggestions = generateMenuSuggestions(products);
    setMenuSuggestions(newSuggestions);
  };
  
  useEffect(() => {
    regenerateSuggestions();
  }, [notes]);
  
  if (notes.length === 0) {
    return null;
  }
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Menüvorschläge</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={regenerateSuggestions}
          className="flex items-center gap-1"
        >
          <Shuffle size={16} />
          <span>Neu generieren</span>
        </Button>
      </div>
      
      {menuSuggestions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {menuSuggestions.map((suggestion, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <p className="text-center">{suggestion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">
            Keine Menüvorschläge verfügbar. Fügen Sie Produkte hinzu, um Vorschläge zu erhalten.
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuSuggestions;
