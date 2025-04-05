
import { corsHeaders } from "../_shared/cors.ts";
import { generateRecipeWithOpenAI } from "./openaiService.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function handleRecipeGeneration(suggestion: string): Promise<Response> {
  console.log("Recipe generation request received for:", suggestion);
  
  if (!suggestion || typeof suggestion !== 'string') {
    console.error("Invalid suggestion for recipe generation:", suggestion);
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
    console.log("Generating recipe for suggestion:", suggestion);
    const recipe = await generateRecipeWithOpenAI(suggestion);
    
    if (!recipe || recipe.trim().length === 0) {
      console.error("Received empty recipe from OpenAI");
      return new Response(
        JSON.stringify({ 
          error: "Leeres Rezept erhalten",
          recipe: "Rezept konnte nicht generiert werden. Bitte versuche es später erneut."
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    console.log("Recipe generated successfully with length:", recipe.length);
    console.log("Recipe preview:", recipe.substring(0, 100) + "...");
    
    return new Response(
      JSON.stringify({ recipe }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error generating recipe:", error);
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
