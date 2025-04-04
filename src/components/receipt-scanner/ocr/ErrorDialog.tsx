
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ErrorDialogProps {
  error: Error | null;
  onDismiss: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, onDismiss }) => {
  if (!error) {
    return null;
  }
  
  return (
    <AlertDialog open={!!error}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Fehler bei der Verarbeitung</AlertDialogTitle>
          <AlertDialogDescription>
            {error.message || 'Es ist ein unbekannter Fehler aufgetreten.'}
            <p className="mt-2">
              Bitte versuche es mit einem klareren Bild oder überprüfe das Bildformat.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Button onClick={onDismiss} className="mt-4">
          Verstanden
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ErrorDialog;
