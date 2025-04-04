
import { corsHeaders } from "../_shared/cors.ts";
import { generateRecipeWithOpenAI } from "./openaiService.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function handleRecipeGeneration(products: any): Promise<Response> {
  if (!products || typeof products !== 'string') {
    console.error("Invalid product for recipe generation");
    return new Response(
      JSON.stringify({ 
        error: "Ungültiger Menüvorschlag",
        recipe: "Rezept konnte nicht generiert werden. Ungültiger Menüvorschlag."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 with a message instead of 400
      }
    );
  }

  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured");
    return new Response(
      JSON.stringify({ 
        recipe: "Rezept konnte nicht generiert werden. API-Schlüssel fehlt."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  }

  try {
    console.log("Generating recipe for:", products);
    const recipe = await generateRecipeWithOpenAI(products);
    console.log("Recipe generated successfully with length:", recipe.length);
    
    return new Response(
      JSON.stringify({ recipe }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error generating recipe:", error);
    // Always return a 200 response with an error message in the body
    return new Response(
      JSON.stringify({ 
        error: error.message,
        recipe: "Rezept konnte nicht generiert werden. Bitte versuche es später erneut."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 even when there's an error
      }
    );
  }
}
