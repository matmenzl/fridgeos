
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
}

const ReceiptDialog: React.FC<ReceiptDialogProps> = ({
  open,
  onOpenChange,
  title = "Quittung scannen",
  description = "Fotografiere eine Quittung oder lade ein Bild hoch, um Produkte zu erfassen.",
  children,
  footerContent
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          {children}
        </div>
        
        {footerContent && (
          <DialogFooter>
            {footerContent}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;
