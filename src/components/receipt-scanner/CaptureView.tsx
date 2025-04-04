
import React from 'react';
import CameraCapture from './CameraCapture';
import LoadingState from './LoadingState';
import ResultsList from './ResultsList';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface CaptureViewProps {
  imageUrl: string | null;
  scanning: boolean;
  results: string[];
  selectedItems: string[];
  onCapture: (capturedImageUrl: string) => void;
  onToggleSelection: (item: string) => void;
  onRemoveItem: (item: string) => void;
  onRetake: () => void;
}

const CaptureView: React.FC<CaptureViewProps> = ({
  imageUrl,
  scanning,
  results,
  selectedItems,
  onCapture,
  onToggleSelection,
  onRemoveItem,
  onRetake
}) => {
  if (!imageUrl) {
    return <CameraCapture onCapture={onCapture} />;
  }

  return (
    <div className="space-y-4">
      {results.length === 0 && scanning ? (
        <LoadingState />
      ) : (
        <>
          <ResultsList 
            results={results} 
            selectedItems={selectedItems} 
            onToggleSelection={onToggleSelection} 
            onRemoveItem={onRemoveItem}
          />
          
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              onClick={onRetake}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Neues Foto
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CaptureView;
