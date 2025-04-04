
import React, { useState } from 'react';
import EditProductDialog from '../product-capture/EditProductDialog';
import { cleanProductName } from '../../utils/productNameCleaner';
import { updateNote, updateReceiptProduct } from '../../services/noteStorage';
import { useToast } from '@/hooks/use-toast';

interface ProductEditHandlerProps {
  onProductUpdate: () => void;
}

const ProductEditHandler: React.FC<ProductEditHandlerProps> = ({ onProductUpdate }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditProduct, setCurrentEditProduct] = useState<{
    id: string;
    productName: string;
    isVoiceNote: boolean;
  }>({
    id: '',
    productName: '',
    isVoiceNote: false
  });
  
  const { toast } = useToast();

  const handleEditClick = (id: string, name: string, isVoice: boolean) => {
    // Clean the product name before showing it in the editor
    const cleanedName = cleanProductName(name);
    
    setCurrentEditProduct({
      id,
      productName: cleanedName,
      isVoiceNote: isVoice
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async (data: any) => {
    console.log('Bearbeitetes Produkt speichern:', data);
    
    try {
      if (data.isVoiceNote) {
        const formattedText = `Produkt: ${data.product}`;
        await updateNote(data.id, formattedText);
      } else {
        await updateReceiptProduct(data.id, data.product);
      }
      
      onProductUpdate();
      
      toast({
        title: "Produkt aktualisiert",
        description: "Das Produkt wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Produkts:', error);
      toast({
        title: "Fehler",
        description: "Beim Aktualisieren des Produkts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditSave}
        initialData={currentEditProduct}
      />
      {/* This component just returns the dialog and exposes handleEditClick */}
      {/* as a render prop for the parent component */}
      {handleEditClick}
    </>
  );
};

// Export both the component and a hook-style function to use it
export default ProductEditHandler;

export const useProductEdit = (onProductUpdate: () => void) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditProduct, setCurrentEditProduct] = useState<{
    id: string;
    productName: string;
    isVoiceNote: boolean;
  }>({
    id: '',
    productName: '',
    isVoiceNote: false
  });
  
  const { toast } = useToast();

  const handleEditClick = (id: string, name: string, isVoice: boolean) => {
    // Clean the product name before showing it in the editor
    const cleanedName = cleanProductName(name);
    
    setCurrentEditProduct({
      id,
      productName: cleanedName,
      isVoiceNote: isVoice
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async (data: any) => {
    console.log('Bearbeitetes Produkt speichern:', data);
    
    try {
      if (data.isVoiceNote) {
        const formattedText = `Produkt: ${data.product}`;
        await updateNote(data.id, formattedText);
      } else {
        await updateReceiptProduct(data.id, data.product);
      }
      
      onProductUpdate();
      
      toast({
        title: "Produkt aktualisiert",
        description: "Das Produkt wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Produkts:', error);
      toast({
        title: "Fehler",
        description: "Beim Aktualisieren des Produkts ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    }
  };

  return {
    editDialogOpen,
    currentEditProduct,
    handleEditClick,
    handleEditSave,
    setEditDialogOpen
  };
};
