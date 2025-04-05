
import { corsHeaders } from "./index.ts";
import { generateRecipe } from "./recipeGenerator.ts";
import { generateMenuSuggestions } from "./menuSuggestionGenerator.ts";

export async function handleRequest(req: Request): Promise<Response> {
  try {
    // Check if the request has a body
    const reqText = await req.text();
    console.log("Request content type:", req.headers.get("content-type"));
    console.log("Request body text:", reqText);
    
    // If the request body is empty, return a simple ping response
    if (!reqText || reqText.trim() === '') {
      console.log("Empty request body - handling ping");
      return new Response(
        JSON.stringify({ status: "ok" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse the request body
    let body;
    try {
      body = JSON.parse(reqText);
      console.log("Request body parsed successfully:", body);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { products, action, retryAttempt } = body;
    
    // Check API key configuration
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiApiKey) {
      throw new Error('OpenAI API-Schlüssel nicht konfiguriert');
    }

    // Route to the appropriate handler based on action
    if (action === 'getRecipe') {
      console.log(`Generating recipe for: "${products}"`);
      console.log(`Is retry attempt: ${retryAttempt ? 'yes' : 'no'}`);
      
      if (!products) {
        throw new Error('Gericht muss übergeben werden');
      }
      
      if (typeof products !== 'string') {
        throw new Error('Gericht muss als String übergeben werden');
      }
      
      const recipe = await generateRecipe(products, openAiApiKey, retryAttempt);
      console.log("Generated recipe length:", recipe.length);
      
      return new Response(
        JSON.stringify({ recipe }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'getMenuSuggestions') {
      // Standard action: generate menu suggestions
      console.log(`Generating menu suggestions for products: ${JSON.stringify(products)}`);
      
      if (!products) {
        throw new Error('Produkte müssen übergeben werden');
      }
      
      if (!Array.isArray(products)) {
        throw new Error('Produkte müssen als Array übergeben werden');
      }
      
      const suggestions = await generateMenuSuggestions(products, openAiApiKey);
      return new Response(
        JSON.stringify({ suggestions: suggestions.slice(0, 6) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'ping') {
      // Simple ping action
      return new Response(
        JSON.stringify({ status: "ok" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Unknown action
      console.error(`Unknown action: ${action}`);
      return new Response(
        JSON.stringify({ error: "Unknown action", providedAction: action }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in request handler:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Ein Fehler ist aufgetreten' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
