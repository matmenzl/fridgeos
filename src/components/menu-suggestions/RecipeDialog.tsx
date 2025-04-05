
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { RecipeDialogProps } from "./types";

const RecipeDialog: React.FC<RecipeDialogProps> = ({ 
  open, 
  onOpenChange, 
  selectedSuggestion, 
  recipe, 
  isLoading 
}) => {
  // Check if the recipe is an error message
  const isErrorMessage = recipe?.startsWith('Rezept konnte nicht');
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedSuggestion}</DialogTitle>
          <DialogDescription>
            Rezept für das ausgewählte Gericht
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <LoaderCircle size={32} className="animate-spin text-primary" />
              <p className="text-muted-foreground">Rezept wird geladen...</p>
            </div>
          ) : isErrorMessage ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <AlertTriangle size={32} className="text-amber-500" />
              <p className="text-muted-foreground">{recipe}</p>
              <p className="text-sm text-muted-foreground">Möglicherweise liegt ein Problem mit der Edge-Funktion vor. Bitte versuche es später erneut.</p>
            </div>
          ) : (
            <div className="recipe-content whitespace-pre-line">
              {recipe}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
          {isErrorMessage && (
            <Button 
              onClick={() => onOpenChange(false)}
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Erneut versuchen</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDialog;
