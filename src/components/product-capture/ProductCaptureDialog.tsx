
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { ProductFormValues, CurrentFieldType } from './types';
import SpeechRecorder from './SpeechRecorder';
import ExpiryDateField from './ExpiryDateField';
import { parseGermanDateFromText, formatGermanDate } from '@/utils/dateParser';

interface ProductCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { text: string, metadata: ProductFormValues }) => void;
}

const ProductCaptureDialog: React.FC<ProductCaptureDialogProps> = ({ 
  open, 
  onOpenChange,
  onSave
}) => {
  const [isListening, setIsListening] = useState(false);
  const [currentField, setCurrentField] = useState<CurrentFieldType>('product');
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  
  const form = useForm<ProductFormValues>({
    defaultValues: {
      product: '',
      expiryDate: undefined,
      quantity: ''
    }
  });

  const handleTranscriptComplete = () => {
    if (!transcript.trim()) return;
    
    switch (currentField) {
      case 'product':
        form.setValue('product', transcript);
        toast({
          title: "Produkt erfasst",
          description: `"${transcript}" als Produkt gespeichert.`,
        });
        setCurrentField('expiryDate');
        break;
      case 'expiryDate':
        // Enhanced date parsing for German dates
        const date = parseGermanDateFromText(transcript);
        
        if (date) {
          form.setValue('expiryDate', date);
          toast({
            title: "Ablaufdatum erfasst",
            description: `Datum ${formatGermanDate(date)} gespeichert.`,
          });
          setCurrentField('quantity');
        } else {
          console.log("Invalid date parsing result:", date);
          toast({
            title: "Datum nicht erkannt",
            description: "Bitte versuche es erneut mit einem Format wie '10. April 2025' oder '10.04.2025'.",
            variant: "destructive",
          });
        }
        break;
      case 'quantity':
        form.setValue('quantity', transcript);
        toast({
          title: "Menge erfasst",
          description: `"${transcript}" als Menge gespeichert.`,
        });
        break;
    }
    
    setTranscript('');
  };

  const handleSubmit = form.handleSubmit((data) => {
    // Make sure we're passing the product name properly
    if (!data.product || !data.product.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Produktnamen ein.",
        variant: "destructive",
      });
      return;
    }
    
    // Create formatted text for display purposes
    const formattedText = `Produkt: ${data.product}${data.expiryDate ? `\nAblaufdatum: ${formatGermanDate(data.expiryDate)}` : ''}${data.quantity ? `\nMenge: ${data.quantity}` : ''}`;
    
    // Call the onSave function with both the formatted text and the metadata
    onSave({
      text: formattedText,
      metadata: data
    });
    
    // Reset the form and close the dialog
    form.reset();
    setCurrentField('product');
    onOpenChange(false);
  });

  const getFieldLabel = () => {
    switch (currentField) {
      case 'product':
        return 'Produkt eingeben (z.B. Fleisch)';
      case 'expiryDate':
        return 'Ablaufdatum eingeben (z.B. 10. April 2025 oder 10.04.2025)';
      case 'quantity':
        return 'Menge eingeben (z.B. 250 Gramm)';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Produkt erfassen</DialogTitle>
          <DialogDescription>
            Erfasse ein neues Produkt mit Spracherkennung oder manuell.
          </DialogDescription>
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
            
            <ExpiryDateField form={form} />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menge</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 250 Gramm" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <SpeechRecorder
              isListening={isListening}
              setIsListening={setIsListening}
              transcript={transcript}
              setTranscript={setTranscript}
              fieldLabel={getFieldLabel()}
              onTranscriptComplete={handleTranscriptComplete}
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

export default ProductCaptureDialog;
