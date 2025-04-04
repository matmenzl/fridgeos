
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FoodCategory, getAllFoodCategories } from '@/utils/foodCategories';
import { useToast } from '@/hooks/use-toast';

interface CategoryExpiry {
  category: FoodCategory;
  daysValid: number;
}

// Local storage key for category expiration data
const CATEGORY_EXPIRY_KEY = 'category-expiry-settings';

const CategoryExpiryManagement = () => {
  const [categoryExpiryData, setCategoryExpiryData] = useState<CategoryExpiry[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load existing data or initialize with default values
    const storedData = localStorage.getItem(CATEGORY_EXPIRY_KEY);
    if (storedData) {
      setCategoryExpiryData(JSON.parse(storedData));
    } else {
      // Initialize with all categories and default values
      const allCategories = getAllFoodCategories();
      const initialData = allCategories.map(category => ({
        category,
        daysValid: getDefaultDaysForCategory(category)
      }));
      setCategoryExpiryData(initialData);
    }
  }, []);
  
  // Get default days based on category type
  const getDefaultDaysForCategory = (category: FoodCategory): number => {
    switch(category) {
      case FoodCategory.FRUECHTE:
        return 7;
      case FoodCategory.GEMUESE:
        return 10;
      case FoodCategory.FLEISCH:
        return 3;
      case FoodCategory.FISCH:
        return 2;
      case FoodCategory.MILCHPRODUKTE:
        return 7;
      default:
        return 30; // Default for other categories
    }
  };
  
  const handleInputChange = (category: FoodCategory, value: string) => {
    const numValue = parseInt(value) || 0;
    setCategoryExpiryData(prev => 
      prev.map(item => 
        item.category === category 
          ? { ...item, daysValid: numValue } 
          : item
      )
    );
  };
  
  const saveSettings = () => {
    localStorage.setItem(CATEGORY_EXPIRY_KEY, JSON.stringify(categoryExpiryData));
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Ablaufdaten wurden erfolgreich aktualisiert.",
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Ablaufdaten für Kategorien verwalten</h1>
      <p className="mb-6 text-muted-foreground">
        Legen Sie hier fest, wie viele Tage ein Produkt einer bestimmten Kategorie standardmäßig haltbar ist.
      </p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Kategorie-Ablaufdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {categoryExpiryData.map((item) => (
              <div key={item.category} className="grid grid-cols-2 gap-4 items-center">
                <Label htmlFor={`expiry-${item.category}`}>{item.category}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`expiry-${item.category}`}
                    type="number"
                    min="1"
                    max="365"
                    value={item.daysValid}
                    onChange={(e) => handleInputChange(item.category, e.target.value)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">Tage</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Button onClick={saveSettings}>Einstellungen speichern</Button>
    </div>
  );
};

export default CategoryExpiryManagement;
