
import React from 'react';
import { ShoppingBag, Trash, Mic, Edit, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FoodCategory } from '../../utils/foodCategories';
import CategoryBadge from './CategoryBadge';
import { getExpiryStatus } from '../../utils/expiryUtils';

interface ProductCardProps {
  id: string;
  name: string;
  isVoice: boolean;
  category: FoodCategory;
  timestamp: number;
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string, isVoice: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  isVoice,
  category,
  timestamp,
  onDelete,
  onEdit
}) => {
  // Get expiry information
  const expiryStatus = getExpiryStatus(timestamp, category);
  
  return (
    <Card key={id} className="w-full p-4 rounded-xl shadow-sm border-0">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {isVoice ? (
              <Mic className="h-4 w-4 text-primary" />
            ) : (
              <ShoppingBag className="h-4 w-4 text-primary" />
            )}
            <h3 className="text-xl font-bold">{name}</h3>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200 rounded-full px-4 py-1">
              {isVoice ? 'Spracherfassung' : 'Bonerfassung'}
            </Badge>
            <CategoryBadge category={category} />
            
            {/* Expiry date badge */}
            <Badge variant="outline" className={`${expiryStatus.color} hover:${expiryStatus.color} border-transparent rounded-full px-4 py-1 flex items-center gap-1`}>
              <Clock className="h-3 w-3" />
              {expiryStatus.text}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(id, name, isVoice)}
              className="text-gray-400 h-10 w-10"
            >
              <Edit className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(id)} 
              className="text-gray-400 h-10 w-10"
            >
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
