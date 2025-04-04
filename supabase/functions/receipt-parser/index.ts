
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
    let rawReceiptData = {};

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

        // Speichere alle relevanten Rohdaten für Diagnose und Extraktion
        rawReceiptData = {
          document_type: result.document?.inference?.prediction?.document_type?.value,
          supplier_name: result.document?.inference?.prediction?.supplier_name?.value,
          receipt_date: result.document?.inference?.prediction?.date?.value,
          total_amount: result.document?.inference?.prediction?.total_amount?.value
        };
        
        // Speichere die Rohprognose
        if (result.document?.inference?.prediction) {
          mindeeRawData = result.document.inference.prediction;
          
          // Extrahiere OCR-Text falls vorhanden
          if (result.document.ocr && result.document.ocr.mvision_v1) {
            ocrText = result.document.ocr.mvision_v1.raw_text;
          }
        }
        
        // Erweiterte Suche nach OCR Text in verschiedenen API-Antwortformaten
        if (!ocrText && result.document?.ocr) {
          // Durchsuche verschiedene mögliche OCR-Formate
          const ocrData = result.document.ocr;
          if (typeof ocrData === 'object') {
            for (const key in ocrData) {
              if (ocrData[key]?.raw_text) {
                ocrText = ocrData[key].raw_text;
                console.log(`OCR-Text aus ${key} gefunden`);
                break;
              }
            }
          }
        }
        
        console.log("Verarbeite Mindee API Antwort...");
        
        // Verbesserte Extraktion von line_items
        if (result.document?.inference?.prediction?.line_items) {
          const items = result.document.inference.prediction.line_items;
          console.log(`Gefundene line_items: ${items.length}`);
          
          // Speichere die Rohdaten für Diagnosezwecke mit allen verfügbaren Feldern
          rawLineItems = items.map(item => {
            const lineItem = {};
            
            // Alle verfügbaren Felder aus dem line_item extrahieren
            for (const key in item) {
              if (typeof item[key] === 'object' && item[key] !== null) {
                if (item[key].value !== undefined) {
                  lineItem[key] = {
                    value: item[key].value,
                    confidence: item[key].confidence || null
                  };
                }
              } else {
                lineItem[key] = item[key];
              }
            }
            
            return lineItem;
          });
          
          console.log(`Extrahierte raw line items: ${JSON.stringify(rawLineItems).substring(0, 500)}...`);
          
          // Verbesserte Extraktion der Produktnamen mit verschiedenen Fallbacks
          products = items
            .filter(item => {
              // Beschreibung kann in verschiedenen Formaten vorliegen
              return (
                (item.description && 
                  (typeof item.description === 'object' && item.description.value && item.description.value !== 'string') || 
                  (typeof item.description === 'string' && item.description !== 'string')
                ) ||
                item.product_code || 
                item.product_type || 
                item.unit_price || 
                item.total_amount
              );
            })
            .map(item => {
              // Versuche zuerst die Beschreibung zu bekommen
              if (item.description) {
                if (typeof item.description === 'object' && item.description.value && item.description.value !== 'string') {
                  return item.description.value;
                } else if (typeof item.description === 'string' && item.description !== 'string') {
                  return item.description;
                }
              }
              
              // Fallbacks in Prioritätsreihenfolge
              if (item.product_code) {
                return typeof item.product_code === 'object' ? item.product_code.value : item.product_code;
              }
              if (item.product_type) {
                return typeof item.product_type === 'object' ? item.product_type.value : item.product_type;
              }
              
              // Wenn keine Beschreibung vorhanden ist, erstelle eine aus vorhandenen Daten
              const amount = item.total_amount ? 
                (typeof item.total_amount === 'object' ? item.total_amount.value : item.total_amount) : 
                null;
              
              const quantity = item.quantity ? 
                (typeof item.quantity === 'object' ? item.quantity.value : item.quantity) : 
                null;
                
              if (quantity && amount) {
                return `Artikel (${quantity} Stück, ${amount}€)`;
              } else if (amount) {
                return `Artikel für ${amount}€`;
              }
              
              // Letzte Option: Generischer Produktname
              return "Artikel auf Kassenbon";
            });
            
          console.log("Extrahierte Produkte:", products);
        }
        
        // Wenn keine Produkte in line_items gefunden wurden, versuche den Lieferantennamen zu extrahieren
        if (products.length === 0 && rawReceiptData.supplier_name) {
          console.log("Keine spezifischen Produkte gefunden, verwende Lieferantennamen:", rawReceiptData.supplier_name);
          products.push(`Einkauf bei ${rawReceiptData.supplier_name}`);
        }
        
        // Wenn immer noch keine Produkte, versuche OCR-Text
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
              !line.toLowerCase().includes('ust') &&
              !line.toLowerCase().includes('euro') &&
              !line.toLowerCase().includes('€') &&
              !line.match(/^\d+([,.]\d{2})?$/) && // Ausschluss reiner Zahlen/Preise
              !line.match(/^\d{2}[.:]\d{2}[.:]\d{4}$/) // Ausschluss von Datumsformaten
            );
            
          // Füge gefilterte Zeilen zu den Produkten hinzu
          if (lines.length > 0) {
            products = lines;
            console.log("Aus OCR extrahierte Zeilen:", products);
          }
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
          document_type: rawReceiptData.document_type,
          supplier_name: rawReceiptData.supplier_name,
          receipt_date: rawReceiptData.receipt_date,
          total_amount: rawReceiptData.total_amount,
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
