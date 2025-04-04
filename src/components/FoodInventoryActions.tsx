
import React from 'react';
import { Search, Camera, Receipt, Mic, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FoodInventoryActionsProps {
  onSearch: (query: string) => void;
  onScanItem: () => void;
  onScanReceipt: () => void;
  onVoice: () => void;
  onAddItem: () => void;
}

const FoodInventoryActions: React.FC<FoodInventoryActionsProps> = ({
  onSearch,
  onScanItem,
  onScanReceipt,
  onVoice,
  onAddItem
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Search items..." 
          className="pl-10 w-full"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          <span>Scan Item</span>
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span>Scan Receipt</span>
        </Button>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          <span>Voice</span>
        </Button>
        
        <Button className="flex items-center gap-2 bg-green-500 hover:bg-green-600">
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </Button>
      </div>
    </div>
  );
};

export default FoodInventoryActions;
