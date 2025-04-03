
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { speechRecognition } from '../services/speechRecognition';
import { useToast } from "@/hooks/use-toast";

interface ProductFormValues {
  product: string;
  expiryDate: Date | undefined;
  quantity: string;
}

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
  const [currentField, setCurrentField] = useState<'product' | 'expiryDate' | 'quantity'>('product');
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  
  const form = useForm<ProductFormValues>({
    defaultValues: {
      product: '',
      expiryDate: undefined,
      quantity: ''
    }
  });

  useEffect(() => {
    speechRecognition.onResult((text) => {
      setTranscript(text);
    });

    speechRecognition.onEnd(() => {
      setIsListening(false);
      handleTranscriptComplete();
    });

    return () => {
      if (isListening) {
        speechRecognition.stop();
      }
    };
  }, [isListening]);

  const handleTranscriptComplete = () => {
    if (transcript) {
      switch (currentField) {
        case 'product':
          form.setValue('product', transcript);
          setCurrentField('expiryDate');
          break;
        case 'expiryDate':
          // Simple date parsing logic - can be expanded for more complex date formats
          try {
            // Try to extract a date from the transcript
            const dateMatch = transcript.match(/(\d{1,2})\.?\s?(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember|Jan|Feb|Mär|Apr|Jun|Jul|Aug|Sep|Okt|Nov|Dez)\.?\s?(\d{4}|\d{2})/i);
            
            if (dateMatch) {
              const date = new Date(transcript);
              if (!isNaN(date.getTime())) {
                form.setValue('expiryDate', date);
              }
            }
          } catch (e) {
            console.error('Failed to parse date from transcript:', transcript);
          }
          setCurrentField('quantity');
          break;
        case 'quantity':
          form.setValue('quantity', transcript);
          break;
      }
      setTranscript('');
    }
  };

  const startListening = () => {
    setTranscript('');
    try {
      speechRecognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast({
        title: "Fehler beim Starten der Spracherkennung",
        description: "Bitte überprüfen Sie die Mikrofonberechtigung.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (isListening) {
      speechRecognition.stop();
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    // Format the complete text for the note
    const formattedDate = data.expiryDate 
      ? format(data.expiryDate, 'dd.MM.yyyy', { locale: de })
      : 'Kein Datum angegeben';
      
    const noteText = `Produkt: ${data.product}\nAblaufdatum: ${formattedDate}\nMenge: ${data.quantity}`;
    
    onSave({
      text: noteText,
      metadata: data
    });
    
    form.reset();
    onOpenChange(false);
  });

  const getFieldLabel = () => {
    switch (currentField) {
      case 'product':
        return 'Produkt eingeben (z.B. Fleisch)';
      case 'expiryDate':
        return 'Ablaufdatum eingeben (z.B. 10. April 2025)';
      case 'quantity':
        return 'Menge eingeben (z.B. 250 Gramm)';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Produkt erfassen</DialogTitle>
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
            
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ablaufdatum</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: de })
                        ) : (
                          <span>Datum auswählen</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        locale={de}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />
            
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
            
            <div className="flex flex-col items-center gap-4 my-4">
              <Button
                type="button"
                onClick={isListening ? stopListening : startListening}
                size="lg"
                className={`rounded-full h-16 w-16 ${
                  isListening ? 'bg-destructive hover:bg-destructive/90 animate-recording' : 'bg-primary hover:bg-primary/90'
                }`}
                aria-label={isListening ? 'Aufnahme stoppen' : 'Aufnahme starten'}
              >
                {isListening ? 'Stop' : 'Aufnehmen'}
              </Button>
              {isListening && (
                <div className="text-center py-2 px-4 rounded-md bg-muted">
                  <p className="font-medium">{getFieldLabel()}</p>
                  {transcript && <p className="mt-2 text-sm">{transcript}</p>}
                </div>
              )}
            </div>
            
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
