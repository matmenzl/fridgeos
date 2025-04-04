
import React from 'react';
import { Pencil, Trash2, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: Date;
}

interface FoodItemsListProps {
  items: FoodItem[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onUpdateQuantity?: (id: string, newQuantity: number) => void;
}

const FoodItemsList: React.FC<FoodItemsListProps> = ({ 
  items, 
  onDelete, 
  onEdit, 
  onUpdateQuantity 
}) => {
  // Function to calculate days until expiry
  const getExpiryText = (expiryDate?: Date): { text: string, color: string } => {
    if (!expiryDate) return { text: '', color: '' };
    
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { text: 'Expires today', color: 'bg-red-100 text-red-800' };
    } else {
      return { 
        text: `Expires in ${diffDays} days`, 
        color: diffDays <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
      };
    }
  };

  return (
    <div className="space-y-4 w-full">
      {items.map((item) => {
        const expiry = getExpiryText(item.expiryDate);
        
        return (
          <Card key={item.id} className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-medium">{item.name}</h3>
                  <p className="text-gray-500">{item.quantity} {item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-8 w-8 border-gray-300"
                    onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full h-8 w-8 border-gray-300"
                    onClick={() => onUpdateQuantity && onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  {expiry.text && (
                    <span className={`text-xs px-3 py-1 rounded-full inline-block ${expiry.color}`}>
                      {expiry.text}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">{item.category}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => onEdit && onEdit(item.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => onDelete && onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default FoodItemsList;
