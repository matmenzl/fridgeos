
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const MINDEE_API_KEY = Deno.env.get("MINDEE_API_KEY");
const MINDEE_API_URL = "https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict";

serve(async (req) => {
  // CORS-Vorflug-Anfragen behandeln
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Request-Body parsen
    const contentType = req.headers.get("content-type") || "";
    let formData;
    let fileData;
    let originalImageFormat = "jpeg"; // Standard-Format

    if (contentType.includes("application/json")) {
      const json = await req.json();
      
      // Wenn das Bild als Base64-String gesendet wird
      if (json.image && json.image.startsWith("data:image")) {
        // Format bestimmen
        if (json.image.includes("data:image/png")) {
          originalImageFormat = "png";
        } else if (json.image.includes("data:image/jpeg") || json.image.includes("data:image/jpg")) {
          originalImageFormat = "jpeg";
        }
        
        // Base64-Daten extrahieren
        const base64Match = json.image.match(/^data:image\/\w+;base64,(.+)$/);
        if (!base64Match) {
          throw new Error("Ungültiges Bildformat");
        }
        
        const base64Data = base64Match[1];
        // Base64 in Binärdaten konvertieren
        fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        console.log(`Bild-Typ erkannt: ${originalImageFormat}, Größe: ${fileData.length} Bytes`);
      } else {
        throw new Error("Bild nicht im korrekten Format");
      }
    } else {
      throw new Error("Nicht unterstützter Content-Type");
    }

    // Neues FormData erstellen
    formData = new FormData();
    const blob = new Blob([fileData], { type: `image/${originalImageFormat}` });
    formData.append("document", blob, `receipt.${originalImageFormat}`);

    let products = [];
    let rawLineItems = [];
    let mindeeError = null;
    let mindeeResponse = null;
    let mindeeRawData = null;
    let ocrText = null;

    // Nur wenn ein API-Schlüssel konfiguriert ist, versuchen wir die Mindee API zu verwenden
    if (MINDEE_API_KEY) {
      try {
        console.log("Sende Anfrage an Mindee API...");
        
        // Anfrage an Mindee API senden mit Timeout von 15 Sekunden
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(MINDEE_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Token ${MINDEE_API_KEY}`
          },
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Überprüfe, ob die Anfrage erfolgreich war
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Mindee API Fehler:", response.status, errorText);
          throw new Error(`Mindee API Fehler: ${response.status} - ${errorText}`);
        }

        // Ergebnis parsen
        const result = await response.json();
        mindeeResponse = result; // Speichere die vollständige Antwort zur Diagnose
        
        console.log("Mindee API Antwort erhalten, Verarbeite Ergebnisse...");
        
        // Speichere die Rohprognose
        if (result.document?.inference?.prediction) {
          mindeeRawData = result.document.inference.prediction;
          
          // Extrahiere OCR-Text falls vorhanden
          if (result.document.ocr && result.document.ocr.mvision_v1) {
            ocrText = result.document.ocr.mvision_v1.raw_text;
          }
        }
        
        // Logge die vollständige Antwortstruktur für Debugging
        console.log("Mindee API Antwort:", JSON.stringify(result).substring(0, 500) + "...");
        
        // Verbesserte Extraktion von line_items
        if (result.document?.inference?.prediction?.line_items) {
          const items = result.document.inference.prediction.line_items;
          console.log(`Gefundene line_items: ${items.length}`);
          
          // Speichere die Rohdaten für Diagnosezwecke
          rawLineItems = items.map(item => {
            // Erstelle ein vollständiges Objekt für jedes line_item
            return {
              description: item.description ? item.description.value : null,
              confidence: item.description ? item.description.confidence : null,
              total_amount: item.total_amount ? item.total_amount.value : null,
              quantity: item.quantity ? item.quantity.value : null,
              unit_price: item.unit_price ? item.unit_price.value : null,
              // Falls relevant, füge weitere Felder hinzu
              raw_item: JSON.stringify(item).substring(0, 1000)
            };
          });
          
          // Protokolliere jedes Item für Debugging
          rawLineItems.forEach((item, index) => {
            console.log(`Line Item ${index + 1}:`, JSON.stringify(item));
          });
          
          // Verbesserte Extraktion der Produktnamen
          products = items
            .filter(item => item.description && item.description.value)
            .map(item => item.description.value);
            
          console.log("Extrahierte Produkte:", products);
        }
        
        // Wenn keine Produkte in line_items gefunden wurden, versuche Textextraktion
        if (products.length === 0 && ocrText) {
          console.log("Keine Produkte in line_items gefunden, extrahiere aus OCR-Text");
          
          // Einfache Textextraktion aus OCR-Daten
          const lines = ocrText.split('\n')
            .map(line => line.trim())
            .filter(line => 
              line.length > 3 && 
              !line.toLowerCase().includes('summe') && 
              !line.toLowerCase().includes('gesamt') && 
              !line.toLowerCase().includes('total') &&
              !line.toLowerCase().includes('mwst') &&
              !line.toLowerCase().includes('ust')
            );
            
          products = lines;
          console.log("Aus OCR extrahierte Zeilen:", products);
        }
        
        if (products.length === 0) {
          mindeeError = "Keine Produkte erkannt oder keine beschreibungen für line items verfügbar";
        }
      } catch (error) {
        console.error("Fehler bei der Mindee API-Verarbeitung:", error);
        mindeeError = error.message;
      }
    } else {
      console.log("Kein Mindee API-Schlüssel konfiguriert, überspringe API-Aufruf");
      mindeeError = "API-Schlüssel nicht konfiguriert";
    }

    // Antwort an den Client senden
    return new Response(
      JSON.stringify({ 
        success: true, 
        products: products,
        useTesseract: products.length === 0,
        mindeeError: mindeeError,
        debug: {
          line_items_raw: rawLineItems,
          document_type: mindeeResponse?.document?.inference?.prediction?.document_type,
          page_count: mindeeResponse?.document?.n_pages,
          has_line_items: mindeeResponse?.document?.inference?.prediction?.line_items ? true : false,
          line_items_count: mindeeResponse?.document?.inference?.prediction?.line_items?.length || 0,
          raw_prediction: mindeeRawData ? JSON.stringify(mindeeRawData).substring(0, 1000) + "..." : null,
          ocr_text: ocrText
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Fehler bei der Verarbeitung:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        useTesseract: true
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
