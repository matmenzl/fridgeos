
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from "@/hooks/use-toast";
import { ProductFormValues } from './types';
import SpeechRecorder from './SpeechRecorder';

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
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  
  const form = useForm<ProductFormValues>({
    defaultValues: {
      product: '',
      expiryDate: undefined,
      quantity: ''
    }
  });

  // Use useEffect to log changes to transcript
  useEffect(() => {
    console.log("Transcript changed:", transcript);
  }, [transcript]);

  const handleTranscriptComplete = () => {
    console.log("Handling transcript completion. Current transcript:", transcript);
    
    if (!transcript.trim()) {
      console.log("Transcript is empty, not processing.");
      return;
    }
    
    console.log("Setting product value:", transcript);
    form.setValue('product', transcript);
    toast({
      title: "Produkt erfasst",
      description: `"${transcript}" als Produkt gespeichert.`,
    });
    
    // Clear transcript after processing
    setTranscript('');
  };

  const handleSubmit = form.handleSubmit((data) => {
    console.log("Form submission with data:", data);
    
    // Make sure we're passing the product name properly
    if (!data.product || !data.product.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Produktnamen ein.",
        variant: "destructive",
      });
      return;
    }
    
    // Create formatted text for display purposes - only include product name
    const formattedText = `Produkt: ${data.product}`;
    
    // Call the onSave function with both the formatted text and the metadata
    onSave({
      text: formattedText,
      metadata: data
    });
    
    // Reset the form and close the dialog
    form.reset();
    onOpenChange(false);
  });

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
            
            <SpeechRecorder
              isListening={isListening}
              setIsListening={setIsListening}
              transcript={transcript}
              setTranscript={setTranscript}
              fieldLabel="Produkt eingeben (z.B. Fleisch)"
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
