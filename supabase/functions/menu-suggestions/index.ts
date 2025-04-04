
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { handleMenuSuggestions } from "./menuSuggestions.ts";
import { handleRecipeGeneration } from "./recipeGeneration.ts";
import { generateFallbackSuggestions } from "./fallbackSuggestions.ts";
import { handleRequest } from "./requestHandler.ts";

serve(async (req) => {
  // CRITICAL: Handle CORS preflight requests properly
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response(null, {
      status: 200, // Make sure to return a 200 status for OPTIONS
      headers: corsHeaders
    });
  }

  try {
    return await handleRequest(req);
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unerwarteter Fehler: ${error.message}`,
        suggestions: generateFallbackSuggestions([]),
        recipe: "Rezept konnte nicht generiert werden. Ein unerwarteter Fehler ist aufgetreten."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 with error message instead of 500 
      }
    );
  }
});
