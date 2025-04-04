
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
        mindeeRawData = result.document?.inference?.prediction; // Speichere die Rohprognose
        
        console.log("Mindee API Antwort erhalten, Verarbeite Ergebnisse...");
        
        // Logge die vollständige Antwortstruktur für Debugging
        console.log("Mindee API Antwort Struktur:", JSON.stringify(result.document.inference).substring(0, 500) + "...");
        
        // Verbesserte Ausgabe der line_items
        if (result.document?.inference?.prediction?.line_items && result.document.inference.prediction.line_items.length > 0) {
          console.log(`Gefundene line_items: ${result.document.inference.prediction.line_items.length}`);
          
          // Alle line_items erfassen, auch ohne Beschreibung oder mit geringer Confidence
          rawLineItems = result.document.inference.prediction.line_items.map(item => {
            const lineItem = {
              description: item.description ? item.description.value : null,
              confidence: item.description ? item.description.confidence : 0,
              total_amount: item.total_amount ? item.total_amount.value : null
            };
            
            console.log("Line item:", JSON.stringify(lineItem));
            return lineItem;
          });
        }
        
        // Verbesserte Funktion zum Extrahieren ALLER Produkte ohne Confidence-Filter
        const extractAllLineItems = (data) => {
          const items = [];
          
          if (data.line_items && data.line_items.length > 0) {
            console.log(`Verarbeite ${data.line_items.length} line_items`);
            
            // Extrahiere alle Text-Informationen, die wir finden können
            data.line_items.forEach((item, index) => {
              // Ausführliches Logging für jedes Item
              console.log(`Item ${index}:`, JSON.stringify(item));
              
              // Sammle alle relevanten Daten, die wir finden können
              if (item.description && item.description.value) {
                items.push(item.description.value);
              } else if (item.product && item.product.value) {
                // Alternative Felder versuchen
                items.push(item.product.value);
              } else if (item.text && item.text.value) {
                items.push(item.text.value);
              } else if (item.item_name && item.item_name.value) {
                items.push(item.item_name.value);
              }
            });
          } else {
            console.log("Keine line_items gefunden, versuche andere Textfelder...");
            
            // Versuche, andere Elemente aus der Quittung zu extrahieren
            if (data.locale && data.locale.value) {
              console.log("Locale gefunden:", data.locale.value);
            }
            
            // Versuche, Text aus OCR-Ergebnissen zu extrahieren
            if (data.ocr_text && data.ocr_text.length > 0) {
              console.log("OCR-Text gefunden, extrahiere mögliche Produkte...");
              
              const lines = data.ocr_text.split("\n").filter(line => 
                line.trim().length > 3 && 
                !line.toLowerCase().includes("summe") && 
                !line.toLowerCase().includes("gesamt") && 
                !line.toLowerCase().includes("mwst") &&
                !line.toLowerCase().includes("danke")
              );
              
              items.push(...lines);
            }
          }
          
          return items.filter(Boolean); // Entferne null-Werte
        };

        products = extractAllLineItems(result.document.inference.prediction);
        console.log("Extrahierte Produkte:", products);
        
        if (products.length === 0) {
          console.log("Keine Produkte von Mindee erkannt, verwende Tesseract als Fallback");
          mindeeError = "Keine Produkte erkannt oder alle Elemente hatten keine Beschreibungen";
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
          raw_prediction: mindeeRawData ? JSON.stringify(mindeeRawData).substring(0, 1000) + "..." : null
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
