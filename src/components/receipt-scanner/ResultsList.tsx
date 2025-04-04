
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
        {results.map((item, index) => {
          // Display text extraction logic
          let displayText = item;
          
          try {
            // Check if it's a JSON string
            if (item.startsWith('{') || item.startsWith('Zeile : {')) {
              // Remove "Zeile : " if present
              const jsonText = item.startsWith('Zeile : ') ? item.substring(8) : item;
              const parsed = JSON.parse(jsonText);
              
              // Extract the description value, which can be either a direct string or an object with a value property
              if (parsed.description) {
                if (typeof parsed.description === 'object' && parsed.description.value) {
                  displayText = parsed.description.value;
                } else if (typeof parsed.description === 'string') {
                  displayText = parsed.description;
                }
              } else {
                // If no description, try to create a meaningful display from other fields
                if (parsed.product_code) {
                  displayText = typeof parsed.product_code === 'object' ? 
                    parsed.product_code.value : parsed.product_code;
                } else if (parsed.product_type) {
                  displayText = typeof parsed.product_type === 'object' ? 
                    parsed.product_type.value : parsed.product_type;
                } else if (parsed.total_amount) {
                  const amount = typeof parsed.total_amount === 'object' ? 
                    parsed.total_amount.value : parsed.total_amount;
                  displayText = `Artikel für ${amount}€`;
                } else {
                  displayText = "Unbekannter Artikel";
                }
              }
            }
            // If the string contains "description" but isn't valid JSON, try to extract it directly
            else if (item.includes('"description"')) {
              const descMatch = item.match(/"description"\s*:\s*"([^"]+)"/);
              if (descMatch && descMatch[1]) {
                displayText = descMatch[1];
              }
            }
          } catch (error) {
            // Keep the original text if there's a parsing error
            console.log('Parsing error for item:', item, error);
          }
          
          return (
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
                <span className="text-sm">{displayText}</span>
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
          );
        })}
      </div>
    </div>
  );
};

export default ResultsList;
