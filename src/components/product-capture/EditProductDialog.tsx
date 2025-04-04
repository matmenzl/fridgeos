
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { ProductFormValues } from './types';
import { cleanProductName } from '../../utils/productNameCleaner';

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProductFormValues) => void;
  initialData: {
    id: string;
    productName: string;
    isVoiceNote: boolean;
  };
}

const EditProductDialog: React.FC<EditProductDialogProps> = ({ 
  open, 
  onOpenChange,
  onSave,
  initialData
}) => {
  const { toast } = useToast();
  
  // Clean the product name to remove quantity information
  const cleanedProductName = cleanProductName(initialData.productName);
  
  const form = useForm<ProductFormValues>({
    defaultValues: {
      product: cleanedProductName,
      id: initialData.id,
      isVoiceNote: initialData.isVoiceNote
    }
  });

  // Update form when initialData changes and ensure product name is cleaned
  useEffect(() => {
    if (open) {
      const cleanedName = cleanProductName(initialData.productName);
      form.reset({
        product: cleanedName,
        id: initialData.id,
        isVoiceNote: initialData.isVoiceNote
      });
    }
  }, [initialData, open, form]);

  const handleSubmit = form.handleSubmit((data) => {
    if (!data.product || !data.product.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Produktnamen ein.",
        variant: "destructive",
      });
      return;
    }
    
    onSave(data);
    
    form.reset();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Produkt bearbeiten</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="product"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Produkt</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Fleisch" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit">Speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
