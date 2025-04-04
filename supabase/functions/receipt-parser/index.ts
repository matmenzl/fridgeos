
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

    if (contentType.includes("application/json")) {
      const json = await req.json();
      
      // Wenn das Bild als Base64-String gesendet wird
      if (json.image && json.image.startsWith("data:image")) {
        // Base64-Daten extrahieren
        const base64Data = json.image.split(";base64,").pop();
        if (!base64Data) {
          throw new Error("Ungültiges Bildformat");
        }
        
        // Base64 in Binärdaten konvertieren
        fileData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      } else {
        throw new Error("Bild nicht im korrekten Format");
      }
    } else {
      throw new Error("Nicht unterstützter Content-Type");
    }

    // Neues FormData erstellen
    formData = new FormData();
    const blob = new Blob([fileData], { type: "image/jpeg" });
    formData.append("document", blob, "receipt.jpg");

    let products = [];
    let mindeeError = null;

    // Nur wenn ein API-Schlüssel konfiguriert ist, versuchen wir die Mindee API zu verwenden
    if (MINDEE_API_KEY) {
      try {
        console.log("Sende Anfrage an Mindee API...");
        
        // Anfrage an Mindee API senden mit Timeout von 10 Sekunden
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
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
          throw new Error(`Mindee API Fehler: ${response.status}`);
        }

        // Ergebnis parsen
        const result = await response.json();
        
        // Nur Produkte aus den line_items der Ergebnisse extrahieren
        const extractLineItems = (data) => {
          const items = [];
          
          // Verwende ausschließlich die Produktlinien
          if (data.prediction?.line_items && data.prediction.line_items.length > 0) {
            data.prediction.line_items.forEach(item => {
              // Confidence threshold lowered from 0.6 to 0.3
              if (item.description && item.description.confidence > 0.3) {
                items.push(item.description.value);
              }
            });
          }
          
          return items;
        };

        products = extractLineItems(result.document);
        console.log("Extrahierte Produkte:", products);
        
        if (products.length === 0) {
          console.log("Keine Produkte von Mindee erkannt, verwende Tesseract als Fallback");
          mindeeError = "Keine Produkte erkannt";
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
        mindeeError: mindeeError
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
