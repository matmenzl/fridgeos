
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, Image as ImageIcon, Utensils } from "lucide-react";
import { extractProductNames, generateMenuSuggestions } from '../utils/productUtils';
import { Note, ProductNote } from '../services/noteStorage';

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
  
  const regenerateSuggestions = () => {
    // Extract products from notes
    const notesProducts = extractProductNames(notes);
    
    // Extract products from receipt products
    const receiptProductNames = receiptProducts.map(product => product.productName);
    
    // Combine both product lists
    const allProducts = [...notesProducts, ...receiptProductNames];
    
    // Generate suggestions based on combined products
    const newSuggestions = generateMenuSuggestions(allProducts);
    setMenuSuggestions(newSuggestions);
    
    // Assign random images from our collection to each suggestion
    const newImages = newSuggestions.map(() => {
      const randomIndex = Math.floor(Math.random() * foodImages.length);
      return foodImages[randomIndex];
    });
    setSuggestionImages(newImages);
  };
  
  useEffect(() => {
    regenerateSuggestions();
  }, [notes, receiptProducts]);
  
  // Only show menu suggestions if we have products (either from notes or receipt products)
  const hasProducts = notes.length > 0 || receiptProducts.length > 0;
  
  if (!hasProducts) {
    return null;
  }
  
  return (
    <div className="my-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Utensils className="text-teal-500" size={24} />
          <h2 className="text-2xl font-semibold">Recipe Suggestions</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={regenerateSuggestions}
          className="flex items-center gap-1 border-green-500 text-green-500 hover:bg-green-50"
        >
          <Shuffle size={16} />
          <span>Generate New</span>
        </Button>
      </div>
      
      {menuSuggestions.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {menuSuggestions.map((suggestion, index) => (
            <Card key={index} className="overflow-hidden border shadow-sm">
              <div className="relative h-40 bg-muted">
                {suggestionImages[index] ? (
                  <img 
                    src={suggestionImages[index]} 
                    alt={`Image for ${suggestion}`}
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No recipe suggestions available. Add products to get suggestions.
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuSuggestions;
