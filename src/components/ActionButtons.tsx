
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Scan } from "lucide-react";

interface ActionButtonsProps {
  onProductDialogOpen: () => void;
  onScannerDialogOpen: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onProductDialogOpen, 
  onScannerDialogOpen 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <Button 
        onClick={onProductDialogOpen}
        variant="outline"
        className="flex flex-col items-center gap-2 h-auto py-4"
      >
        <Plus size={24} />
        <span>Produkt per Voice erfassen</span>
      </Button>
      
      <Button 
        onClick={onScannerDialogOpen}
        variant="outline"
        className="flex flex-col items-center gap-2 h-auto py-4"
      >
        <Scan size={24} />
        <span>Quittung scannen</span>
      </Button>
    </div>
  );
};

export default ActionButtons;
