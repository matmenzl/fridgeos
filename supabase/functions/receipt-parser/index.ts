
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
    // Überprüfen, ob der API-Schlüssel vorhanden ist
    if (!MINDEE_API_KEY) {
      throw new Error("Mindee API-Schlüssel nicht gefunden");
    }

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

    console.log("Sende Anfrage an Mindee API...");
    
    // Anfrage an Mindee API senden
    const response = await fetch(MINDEE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Token ${MINDEE_API_KEY}`
      },
      body: formData
    });

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
      const products = [];
      
      // Verwende ausschließlich die Produktlinien
      if (data.prediction?.line_items && data.prediction.line_items.length > 0) {
        data.prediction.line_items.forEach(item => {
          if (item.description && item.description.confidence > 0.6) {
            products.push(item.description.value);
          }
        });
      }
      
      return products;
    };

    const extractedProducts = extractLineItems(result.document);
    console.log("Extrahierte Produkte:", extractedProducts);

    // Antwort an den Client senden
    return new Response(
      JSON.stringify({ 
        success: true, 
        products: extractedProducts,
        raw: result // Vollständige Antwort für Debugging
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
        error: error.message 
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
