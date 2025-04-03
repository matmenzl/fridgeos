
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  }, [isListening, transcript, currentField]);

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
        try {
          const text = transcript.toLowerCase();
          let date = null;
          
          // Define month mappings for German
          const months = {
            'januar': 0, 'februar': 1, 'märz': 2, 'april': 3, 'mai': 4, 'juni': 5,
            'juli': 6, 'august': 7, 'september': 8, 'oktober': 9, 'november': 10, 'dezember': 11,
            'jan': 0, 'feb': 1, 'mär': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dez': 11
          };
          
          // Multiple regex patterns to catch different formats
          
          // Pattern 1: "10. April 2025" or "10 April 2025"
          const longFormatRegex = /(\d{1,2})\.?\s?(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|jan|feb|mär|apr|jun|jul|aug|sep|okt|nov|dez)\.?\s?(\d{4}|\d{2})/i;
          
          // Pattern 2: "10.04.2025" or "10-04-2025" or "10/04/2025"
          const numericFormatRegex = /(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{4}|\d{2})/;
          
          let match = text.match(longFormatRegex);
          
          if (match) {
            const day = parseInt(match[1], 10);
            const monthName = match[2].toLowerCase();
            const monthIndex = months[monthName];
            let year = parseInt(match[3], 10);
            
            // Handle 2-digit years
            if (year < 100) {
              year += year < 50 ? 2000 : 1900;
            }
            
            date = new Date(year, monthIndex, day);
          } else {
            // Try numeric format
            match = text.match(numericFormatRegex);
            if (match) {
              const day = parseInt(match[1], 10);
              const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
              let year = parseInt(match[3], 10);
              
              // Handle 2-digit years
              if (year < 100) {
                year += year < 50 ? 2000 : 1900;
              }
              
              date = new Date(year, month, day);
            }
          }
          
          // Check if we have a valid date and it's not too far in the future (sanity check)
          if (date && !isNaN(date.getTime()) && date > new Date() && date < new Date(2050, 0, 1)) {
            form.setValue('expiryDate', date);
            toast({
              title: "Ablaufdatum erfasst",
              description: `Datum ${format(date, 'dd.MM.yyyy', { locale: de })} gespeichert.`,
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
        } catch (e) {
          console.error('Failed to parse date from transcript:', transcript, e);
          toast({
            title: "Fehler bei der Datumserkennung",
            description: "Bitte versuche es erneut mit einem klaren Datumsformat.",
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

  const startListening = () => {
    setTranscript('');
    try {
      speechRecognition.start();
      setIsListening(true);
      toast({
        title: `${getFieldLabel()}`,
        description: "Spracherkennung läuft...",
      });
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
                  isListening ? 'bg-destructive hover:bg-destructive/90 animate-pulse' : 'bg-primary hover:bg-primary/90'
                }`}
                aria-label={isListening ? 'Aufnahme stoppen' : 'Aufnahme starten'}
              >
                {isListening ? 'Stop' : 'Aufnehmen'}
              </Button>
              {isListening && (
                <div className="text-center py-2 px-4 rounded-md bg-muted w-full">
                  <p className="font-medium">{getFieldLabel()}</p>
                  {transcript && <p className="mt-2 text-sm italic">{transcript}</p>}
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
