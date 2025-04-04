
import { corsHeaders } from "../_shared/cors.ts";
import { generateFallbackSuggestions } from "./fallbackSuggestions.ts";
import { generateMenuSuggestionsWithOpenAI } from "./openaiService.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

export async function handleMenuSuggestions(products: any[]): Promise<Response> {
  if (!Array.isArray(products) || products.length === 0) {
    console.error("Invalid or empty products array");
    return new Response(
      JSON.stringify({ 
        error: "Keine Produkte angegeben",
        suggestions: generateFallbackSuggestions([])
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 with a message instead of 400
      }
    );
  }

  console.log("Generating menu suggestions for products:", JSON.stringify(products, null, 2));
  
  try {
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      // Return fallback suggestions if OpenAI API key is not available
      const fallbackSuggestions = generateFallbackSuggestions(products);
      return new Response(
        JSON.stringify({ suggestions: fallbackSuggestions }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }
    
    const suggestions = await generateMenuSuggestionsWithOpenAI(products);
    console.log("Generated", suggestions.length, "menu suggestions");
    
    return new Response(
      JSON.stringify({ suggestions }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error generating menu suggestions:", error);
    
    // Return fallback suggestions if OpenAI API fails
    const fallbackSuggestions = generateFallbackSuggestions(products);
    return new Response(
      JSON.stringify({ 
        suggestions: fallbackSuggestions,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Still return 200 with fallback data
      }
    );
  }
}
