
import React from 'react';
import { Check } from "lucide-react";

interface ResultsListProps {
  results: string[];
  selectedItems: string[];
  onToggleSelection: (item: string) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({
  results,
  selectedItems,
  onToggleSelection
}) => {
  if (results.length === 0) {
    return (
      <div className="bg-muted p-4 rounded-md text-center">
        <p className="text-sm text-muted-foreground">
          Keine Produkte erkannt. Versuche es mit einem besseren Foto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Erkannte Produkte:</p>
      <div className="max-h-64 overflow-y-auto bg-muted rounded-md p-2">
        {results.map((item, index) => (
          <div 
            key={index}
            onClick={() => onToggleSelection(item)}
            className={`flex justify-between items-center p-2 rounded-md cursor-pointer mb-1 ${
              selectedItems.includes(item) ? 'bg-primary/20 border border-primary/50' : 'bg-background hover:bg-accent'
            }`}
          >
            <span className="text-sm">{item}</span>
            {selectedItems.includes(item) ? (
              <Check className="h-4 w-4 text-primary" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
