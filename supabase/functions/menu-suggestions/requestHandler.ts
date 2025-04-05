
import { corsHeaders } from "../_shared/cors.ts";
import { handleMenuSuggestions } from "./menuSuggestions.ts";
import { handleRecipeGeneration } from "./recipeGeneration.ts";
import { generateFallbackSuggestions } from "./fallbackSuggestions.ts";

export async function handleRequest(req: Request): Promise<Response> {
  // Safely parse request body with comprehensive error handling
  let reqBody;
  const contentType = req.headers.get("content-type") || "";
  console.log("Request content type:", contentType);
  
  try {
    // Only try to parse body if the content type is JSON
    if (contentType.includes("application/json")) {
      const bodyText = await req.text();
      console.log("Request body text:", bodyText);
      
      if (!bodyText || bodyText.trim().length === 0) {
        console.log("Empty request body - handling ping");
        // For empty body requests, handle as a ping
        return new Response(
          JSON.stringify({ status: "ok" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      }
      
      try {
        reqBody = JSON.parse(bodyText);
        console.log("Request body parsed successfully:", JSON.stringify(reqBody, null, 2));
      } catch (e) {
        console.error("Error parsing JSON body:", e);
        return new Response(
          JSON.stringify({ 
            error: `Invalid JSON in request body: ${e.message}`,
            suggestions: generateFallbackSuggestions([])
          }),
          { 
            status: 200, // Return 200 with fallback suggestions instead of error
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    } else {
      console.error("Unsupported content type:", contentType);
      return new Response(
        JSON.stringify({ 
          error: `Unsupported Content-Type: ${contentType}. Expected application/json.`,
          suggestions: generateFallbackSuggestions([])
        }),
        { 
          status: 200, // Return 200 with fallback suggestions instead of error
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  } catch (e) {
    console.error("Error reading request body:", e);
    return new Response(
      JSON.stringify({ 
        error: `Failed to read request body: ${e.message}`,
        suggestions: generateFallbackSuggestions([])
      }),
      { 
        status: 200, // Return 200 with fallback suggestions instead of error
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  // Handle empty body as a ping request
  if (!reqBody || Object.keys(reqBody).length === 0) {
    console.log("Empty request body object - handling ping");
    return new Response(
      JSON.stringify({ status: "ok" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  }

  // Get action and products from request body
  const { products, action } = reqBody || {};
  console.log("Action:", action, "Products:", typeof products === 'string' ? products : Array.isArray(products) ? products.length : typeof products);

  if (action === "ping") {
    return new Response(
      JSON.stringify({ status: "ok" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  }

  // Handle the different action types
  if (action === "getMenuSuggestions") {
    return await handleMenuSuggestions(products);
  } else if (action === "getRecipe") {
    console.log("Handling recipe generation for:", products);
    if (typeof products !== 'string') {
      console.error("Invalid product type for recipe generation:", typeof products);
      return new Response(
        JSON.stringify({ 
          error: "Ungültiger Menüvorschlag-Typ",
          recipe: "Rezept konnte nicht generiert werden. Ungültiger Menüvorschlag-Typ." 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    return await handleRecipeGeneration(products);
  } else {
    console.error("Invalid action:", action);
    return new Response(
      JSON.stringify({ 
        error: "Ungültige Aktion",
        suggestions: generateFallbackSuggestions([]) 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 with a message instead of 400
      }
    );
  }
}
