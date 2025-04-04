
import React from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";

interface EmptySuggestionsProps {
  isLoading: boolean;
}

const EmptySuggestions: React.FC<EmptySuggestionsProps> = ({ isLoading }) => {
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
};

export default EmptySuggestions;
