
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiKeyDialogProps } from "./types";

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>OpenAI API-Schlüssel</DialogTitle>
          <DialogDescription>
            Neuerdings werden API-Schlüssel sicher auf dem Server gespeichert. 
            Der OpenAI API-Schlüssel wurde bereits in den Supabase-Einstellungen hinterlegt, 
            daher ist keine Eingabe mehr erforderlich.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
