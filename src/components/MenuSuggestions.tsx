import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, Image as ImageIcon, Refrigerator, Wifi, AlertCircle, LoaderCircle, Book } from "lucide-react";
import { extractProductNames, generateMenuSuggestions, getRecipeForSuggestion } from '../utils/productUtils';
import { Note, ProductNote } from '../services/noteStorage';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../integrations/supabase/client";

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
  const [apiKey, setApiKey] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string>('');
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Prüfe, ob die Edge-Funktion verfügbar ist
  const checkSupabaseFunction = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('menu-suggestions', {
        body: { action: 'ping' }
      });
      
      // Auch wenn ein Fehler auftritt, reicht es, dass die Funktion existiert
      return true;
    } catch (error) {
      console.error('Supabase Edge-Funktion nicht verfügbar:', error);
      return false;
    }
  };
  
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
  
  const saveApiKey = async () => {
    if (apiKey.trim()) {
      try {
        // Wir speichern den API-Schlüssel nicht mehr im localStorage
        // Stattdessen verwenden wir die Edge-Funktion
        toast({
          title: "Information",
          description: "API-Schlüssel werden nun sicher in Supabase gespeichert. Ihr Key im localStorage wird in Zukunft nicht mehr verwendet.",
        });
        
        // Wir versuchen, die Funktion zu verwenden
        await regenerateSuggestions();
        setApiKeyDialogOpen(false);
      } catch (error) {
        console.error('Fehler beim Testen des API-Schlüssels:', error);
        toast({
          title: "Fehler",
          description: "Es gab ein Problem bei der Verbindung mit der API. Bitte versuche es später erneut.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Fehler",
        description: "Bitte gib einen gültigen API-Schlüssel ein.",
        variant: "destructive",
      });
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
        // Wir prüfen nicht mehr, ob ein API-Schlüssel im localStorage ist
        // Stattdessen prüfen wir, ob die Edge-Funktion erreichbar ist
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
      
      {menuSuggestions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {menuSuggestions.map((suggestion, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative h-40 bg-muted">
                {suggestionImages[index] ? (
                  <img 
                    src={suggestionImages[index]} 
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
                    onClick={() => handleGetRecipe(suggestion)}
                    className="flex items-center gap-1"
                  >
                    <Book size={16} />
                    <span>Rezept anzeigen</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
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
      )}
      
      {/* Wir behalten den API-Key-Dialog für den Übergang bei */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenAI API-Schlüssel</DialogTitle>
            <DialogDescription>
              Neuerdings werden API-Schlüssel sicher auf dem Server gespeichert. Der OpenAI API-Schlüssel wurde bereits in den Supabase-Einstellungen hinterlegt, daher ist keine Eingabe mehr erforderlich.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recipe Dialog */}
      <Dialog open={recipeDialogOpen} onOpenChange={setRecipeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSuggestion}</DialogTitle>
            <DialogDescription>
              Rezept für das ausgewählte Gericht
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingRecipe ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <LoaderCircle size={32} className="animate-spin text-primary" />
                <p className="text-muted-foreground">Rezept wird geladen...</p>
              </div>
            ) : (
              <div className="recipe-content whitespace-pre-line">
                {recipe}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecipeDialogOpen(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuSuggestions;
