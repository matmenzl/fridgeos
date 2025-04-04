
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
        
        // Logge die vollständige Antwortstruktur für Debugging
        console.log("Mindee API Antwort Struktur:", JSON.stringify(result.document.inference).substring(0, 500) + "...");
        
        // Speichere alle line_items für Debugging, auch mit geringer Confidence
        if (result.document?.inference?.prediction?.line_items && result.document.inference.prediction.line_items.length > 0) {
          console.log(`Gefundene line_items: ${result.document.inference.prediction.line_items.length}`);
          rawLineItems = result.document.inference.prediction.line_items.map(item => ({
            description: item.description ? item.description.value : null,
            confidence: item.description ? item.description.confidence : 0,
            total_amount: item.total_amount ? item.total_amount.value : null
          }));
        }
        
        // Neue verbesserte Funktion zum Extrahieren der Produkte
        const extractLineItems = (data) => {
          const items = [];
          
          // Nur Produkt-Linien extrahieren, wenn vorhanden
          if (data.prediction?.line_items && data.prediction.line_items.length > 0) {
            console.log(`Verarbeite ${data.prediction.line_items.length} line_items`);
            
            data.prediction.line_items.forEach((item, index) => {
              // Ausführliches Logging für jedes Item
              console.log(`Item ${index}:`, JSON.stringify(item));
              
              // Extrahiere Produkte mit jeder Confidence
              if (item.description) {
                // Wenn die Confidence > 0, nehmen wir es
                items.push({
                  value: item.description.value,
                  confidence: item.description.confidence
                });
              }
            });
          } else {
            console.log("Keine line_items in der Antwort gefunden oder leeres Array");
            
            // Versuche andere Felder in der API-Antwort zu finden
            if (data.prediction) {
              console.log("Vorhandene Felder in prediction:", Object.keys(data.prediction));
              
              // Wenn keine line_items vorhanden sind, versuche, den gesamten Text zu extrahieren
              if (data.prediction.locale && data.prediction.locale.value) {
                console.log("Locale gefunden:", data.prediction.locale.value);
              }
              
              // Versuche Textextraktion, wenn vorhanden
              if (data.prediction.total_amount && data.prediction.total_amount.value) {
                console.log("Gesamtbetrag gefunden:", data.prediction.total_amount.value);
              }
            }
          }
          
          // Sortiere nach Confidence (höchste zuerst) und extrahiere die Werte
          // KEINE Filterung mehr nach Confidence, wir nehmen einfach alles
          return items.sort((a, b) => b.confidence - a.confidence).map(item => item.value);
        };

        products = extractLineItems(result.document);
        console.log("Extrahierte Produkte:", products);
        
        if (products.length === 0) {
          console.log("Keine Produkte von Mindee erkannt, verwende Tesseract als Fallback");
          mindeeError = "Keine Produkte erkannt oder alle Elemente unter Confidence-Schwelle";
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
          line_items_count: mindeeResponse?.document?.inference?.prediction?.line_items?.length || 0
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
