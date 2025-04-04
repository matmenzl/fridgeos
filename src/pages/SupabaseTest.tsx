
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { testSupabaseConnection, saveNote, saveReceiptProduct, getAllNotes, getAllReceiptProducts, testDatabaseSchema } from '../services/noteStorage';
import { useToast } from "@/hooks/use-toast";

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [notesCount, setNotesCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [schemaStatus, setSchemaStatus] = useState<string | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus(result);
      toast({
        title: result.success ? "Verbindung erfolgreich" : "Verbindungsfehler",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Test fehlgeschlagen:", error);
      setConnectionStatus({
        success: false,
        message: `Fehler: ${error instanceof Error ? error.message : String(error)}`
      });
      toast({
        title: "Testfehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSchema = async () => {
    setLoading(true);
    try {
      const result = await testDatabaseSchema();
      setSchemaStatus(
        result.success 
          ? `Schema-Test erfolgreich: ${result.message || 'Keine Probleme gefunden'}` 
          : `Schema-Test fehlgeschlagen: ${result.error?.message || 'Unbekannter Fehler'}`
      );
      toast({
        title: result.success ? "Schema-Test erfolgreich" : "Schema-Test fehlgeschlagen",
        description: result.message || result.error?.message || 'Keine Details verfügbar',
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error("Schema-Test fehlgeschlagen:", error);
      setSchemaStatus(`Fehler: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Schema-Test fehlgeschlagen",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const notes = await getAllNotes();
      setNotesCount(notes.length);
      
      const products = await getAllReceiptProducts();
      setProductsCount(products.length);
    } catch (error) {
      console.error("Fehler beim Abrufen der Anzahlen:", error);
      toast({
        title: "Fehler",
        description: "Anzahl der Einträge konnte nicht abgerufen werden",
        variant: "destructive",
      });
    }
  };

  const testSaveNote = async () => {
    setLoading(true);
    try {
      const result = await saveNote("Testprodukt " + new Date().toLocaleTimeString());
      toast({
        title: result ? "Notiz gespeichert" : "Fehler beim Speichern",
        description: result ? "Notiz wurde erfolgreich gespeichert" : "Notiz konnte nicht gespeichert werden",
        variant: result ? "default" : "destructive",
      });
      fetchCounts();
    } catch (error) {
      console.error("Speichern fehlgeschlagen:", error);
      toast({
        title: "Speicherfehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSaveProduct = async () => {
    setLoading(true);
    try {
      const result = await saveReceiptProduct("Testquittungsprodukt " + new Date().toLocaleTimeString());
      toast({
        title: result ? "Produkt gespeichert" : "Fehler beim Speichern",
        description: result ? "Produkt wurde erfolgreich gespeichert" : "Produkt konnte nicht gespeichert werden",
        variant: result ? "default" : "destructive",
      });
      fetchCounts();
    } catch (error) {
      console.error("Speichern fehlgeschlagen:", error);
      toast({
        title: "Speicherfehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Supabase Verbindungstest</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Verbindungsstatus</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            onClick={testConnection} 
            disabled={loading}
          >
            Verbindung testen
          </Button>
          <Button 
            onClick={testSchema} 
            disabled={loading}
            variant="outline"
          >
            Schema testen
          </Button>
        </div>
        
        {connectionStatus && (
          <div className={`p-4 rounded-md ${connectionStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-semibold">
              {connectionStatus.success ? '✅ Verbunden' : '❌ Fehler'}
            </p>
            <p>{connectionStatus.message}</p>
          </div>
        )}
        
        {schemaStatus && (
          <div className={`p-4 mt-4 rounded-md ${schemaStatus.includes('erfolgreich') ? 'bg-green-100' : 'bg-yellow-100'}`}>
            <p className="font-semibold">Schema-Test Ergebnis:</p>
            <p>{schemaStatus}</p>
          </div>
        )}
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Datenbankinhalt</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="font-semibold">Notizen:</p>
            <p className="text-2xl">{notesCount !== null ? notesCount : '...'}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="font-semibold">Quittungsprodukte:</p>
            <p className="text-2xl">{productsCount !== null ? productsCount : '...'}</p>
          </div>
        </div>
        <Button onClick={fetchCounts} className="mb-4" variant="outline">
          Aktualisieren
        </Button>
      </Card>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Testelemente hinzufügen</h2>
        <div className="flex gap-4">
          <Button onClick={testSaveNote} disabled={loading}>
            Notiz hinzufügen
          </Button>
          <Button onClick={testSaveProduct} disabled={loading}>
            Quittungsprodukt hinzufügen
          </Button>
        </div>
      </Card>

      <div className="mt-8">
        <a href="/" className="text-blue-500 hover:underline">
          Zurück zur Hauptseite
        </a>
      </div>
    </div>
  );
};

export default SupabaseTest;
