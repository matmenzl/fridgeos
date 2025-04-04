
export interface MenuSuggestionsProps {
  notes: { text: string; id: string; timestamp: number }[];
  receiptProducts?: { productName: string; id: string; timestamp: number }[];
}

export interface RecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSuggestion: string | null;
  recipe: string;
  isLoading: boolean;
}

export interface SuggestionCardProps {
  suggestion: string;
  imageUrl?: string;
  onGetRecipe: (suggestion: string) => void;
}

export interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Constants
export const foodImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=500",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=500",
];
