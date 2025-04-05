
import React from 'react';
import { Check, Trash } from "lucide-react";
import { Button } from '@/components/ui/button';

interface ResultsListProps {
  results: string[];
  selectedItems: string[];
  onToggleSelection: (item: string) => void;
  onRemoveItem?: (item: string) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({
  results,
  selectedItems,
  onToggleSelection,
  onRemoveItem
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
            className={`flex justify-between items-center p-2 rounded-md mb-1 ${
              selectedItems.includes(item) ? 'bg-primary/20 border border-primary/50' : 'bg-background hover:bg-accent'
            }`}
          >
            <div 
              className="flex-grow cursor-pointer"
              onClick={() => onToggleSelection(item)}
            >
              <span className="text-sm">{item}</span>
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.includes(item) && (
                <Check className="h-4 w-4 text-primary" />
              )}
              {onRemoveItem && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 p-0.5 text-destructive" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsList;
