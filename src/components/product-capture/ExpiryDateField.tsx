
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from './types';

interface ExpiryDateFieldProps {
  form: UseFormReturn<ProductFormValues>;
}

const ExpiryDateField: React.FC<ExpiryDateFieldProps> = ({ form }) => {
  return (
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
  );
};

export default ExpiryDateField;
