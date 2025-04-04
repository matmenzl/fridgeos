
import { corsHeaders } from "../_shared/cors.ts";
import { extractProductsFromReceipt } from "./mindeeParser.ts";
import { processImageFromRequest } from "./imageHandler.ts";

// Handle requests from the frontend
Deno.serve(async (req) => {
  // IMPORTANT: Handle CORS preflight requests properly
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    console.log("Receipt-parser function called");
    
    // Process image from the request
    try {
      const { formData, originalImageFormat } = await processImageFromRequest(req);
      console.log("Image processed successfully, format:", originalImageFormat);
      
      // Call Mindee API to extract information
      const { products, debug, error: mindeeError } = await extractProductsFromReceipt(formData);
      
      console.log(`Extracted ${products.length} products from receipt`);
      
      // Return the results
      return new Response(
        JSON.stringify({
          success: true,
          products,
          debug,
          mindeeError,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      console.error("Error processing receipt:", error);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
          useTesseract: true,
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in receipt-parser:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: `Server error: ${error.message}`,
        useTesseract: true,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
