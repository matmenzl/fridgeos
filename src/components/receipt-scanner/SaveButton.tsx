
import React from 'react';
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  selectedItemsCount: number;
  onSave: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ selectedItemsCount, onSave }) => {
  return (
    <Button 
      onClick={onSave}
      disabled={selectedItemsCount === 0}
    >
      {selectedItemsCount} Produkte speichern
    </Button>
  );
};

export default SaveButton;
