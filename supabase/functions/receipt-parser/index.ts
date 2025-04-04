
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { processImageFromRequest } from "./imageHandler.ts";
import { extractProductsFromMindee } from "./mindeeParser.ts";
import { ParserResponse, MindeeResponse, RequestBody } from "./types.ts";

const MINDEE_API_KEY = Deno.env.get("MINDEE_API_KEY");
const MINDEE_API_URL = "https://api.mindee.net/v1/products/mindee/expense_receipts/v5/predict";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Process the image from the request
    const { formData } = processImageFromRequest(req);

    let products: string[] = [];
    let rawLineItems: any[] = [];
    let mindeeError: string | null = null;
    let mindeeResponse: MindeeResponse | null = null;
    let mindeeRawData: any = null;
    let ocrText: string | null = null;
    let rawReceiptData: any = {};

    // Only attempt to use Mindee API if an API key is configured
    if (MINDEE_API_KEY) {
      try {
        console.log("Sending request to Mindee API...");
        
        // Send request to Mindee API with a 15-second timeout
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

        // Check if the request was successful
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Mindee API Error:", response.status, errorText);
          throw new Error(`Mindee API Error: ${response.status} - ${errorText}`);
        }

        // Parse the result
        const result = await response.json();
        mindeeResponse = result;
        
        console.log("Mindee API response received, processing results...");

        // Store all relevant raw data for diagnosis and extraction
        rawReceiptData = {
          document_type: result.document?.inference?.prediction?.document_type?.value,
          supplier_name: result.document?.inference?.prediction?.supplier_name?.value,
          receipt_date: result.document?.inference?.prediction?.date?.value,
          total_amount: result.document?.inference?.prediction?.total_amount?.value
        };
        
        // Extract products and related data
        const extractionResult = extractProductsFromMindee(result, rawReceiptData);
        products = extractionResult.products;
        rawLineItems = extractionResult.rawLineItems;
        ocrText = extractionResult.ocrText;
        mindeeRawData = extractionResult.mindeeRawData;
        
        if (products.length === 0) {
          mindeeError = "No products recognized or no descriptions available for line items";
        }
      } catch (error) {
        console.error("Error processing Mindee API:", error);
        mindeeError = error.message;
      }
    } else {
      console.log("No Mindee API key configured, skipping API call");
      mindeeError = "API key not configured";
    }

    // Prepare response to client
    const responseData: ParserResponse = {
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
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    
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
