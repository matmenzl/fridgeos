
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import OpenAI from "https://deno.land/x/openai@v4.16.1/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    // Safely parse request body with comprehensive error handling
    let reqBody;
    const contentType = req.headers.get("content-type") || "";
    console.log("Request content type:", contentType);
    
    try {
      // Only try to parse body if the content type is JSON
      if (contentType.includes("application/json")) {
        const bodyText = await req.text();
        console.log("Request body length:", bodyText.length);
        
        if (!bodyText || bodyText.trim().length === 0) {
          console.error("Empty request body");
          return new Response(
            JSON.stringify({ 
              error: "Empty request body",
              suggestions: generateFallbackSuggestions([])
            }),
            { 
              status: 200, // Return 200 with fallback suggestions instead of error
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            }
          );
        }
        
        try {
          reqBody = JSON.parse(bodyText);
          console.log("Request body parsed successfully:", JSON.stringify(reqBody));
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

    const { products = [], action = "getMenuSuggestions" } = reqBody || {};
    console.log("Action:", action, "Products:", Array.isArray(products) ? products.length : typeof products);

    if (action === "ping") {
      return new Response(
        JSON.stringify({ status: "ok" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      
      if (action === "getMenuSuggestions") {
        // Return fallback suggestions if OpenAI API key is not available
        const fallbackSuggestions = generateFallbackSuggestions(products);
        return new Response(
          JSON.stringify({ suggestions: fallbackSuggestions }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          }
        );
      } else if (action === "getRecipe") {
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
    }

    if (action === "getMenuSuggestions") {
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
    } else if (action === "getRecipe") {
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

      try {
        const recipe = await generateRecipeWithOpenAI(products);
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
            status: 200 // Still return 200 with error message
          }
        );
      }
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
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        error: `Unerwarteter Fehler: ${error.message}`,
        suggestions: generateFallbackSuggestions([]),
        recipe: null
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 // Return 200 with error message instead of 500 
      }
    );
  }
});

// Generate menu suggestions with OpenAI
async function generateMenuSuggestionsWithOpenAI(products: string[]): Promise<string[]> {
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY || "",
  });

  const uniqueProducts = [...new Set(products)].filter(product => product && product.trim().length > 0);
  
  const prompt = `
Ich habe folgende Lebensmittel: ${uniqueProducts.join(', ')}.
Erstelle 6 kreative Menüvorschläge, die ich mit diesen Zutaten (oder einigen davon) kochen könnte.
Antworte nur mit einer Liste von 6 Menüvorschlägen, einer pro Zeile, ohne Nummerierung oder weitere Erklärungen.
`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Du bist ein hilfreicher Assistent, der kreative Kochvorschläge macht." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const response = chatCompletion.choices[0].message.content || "";
  const suggestions = response
    .split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, 6);
  
  return suggestions;
}

// Generate recipe with OpenAI
async function generateRecipeWithOpenAI(menuSuggestion: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY || "",
  });

  const prompt = `
Erstelle ein detailliertes Rezept für "${menuSuggestion}". 
Bitte gib Zutaten und Zubereitungsschritte an.
`;

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Du bist ein erfahrener Koch, der hilfreiche und detaillierte Rezepte schreibt." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return chatCompletion.choices[0].message.content || "Rezept konnte nicht generiert werden.";
}

// Generate fallback menu suggestions without API
function generateFallbackSuggestions(products: string[]): string[] {
  const suggestions: string[] = [];
  const filteredProducts = products.filter(p => p && typeof p === 'string' && p.trim().length > 1);
  
  if (filteredProducts.length === 0) {
    return [
      "Pasta mit Tomatensauce",
      "Gemüsepfanne",
      "Kartoffelauflauf",
      "Reis mit Gemüse",
      "Salat mit Brot",
      "Pfannkuchen"
    ];
  }
  
  // Create combinations of products
  const mealTypes = ['Auflauf', 'Salat', 'Suppe', 'Pfanne', 'Eintopf', 'mit Sauce'];
  
  // Generate unique meal type suggestions
  for (let i = 0; i < Math.min(6, filteredProducts.length * mealTypes.length); i++) {
    const randomProduct = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
    const mealType = mealTypes[i % mealTypes.length];
    
    let suggestion = `${randomProduct}-${mealType}`;
    
    if (suggestions.includes(suggestion)) {
      // Try another combination
      const anotherProduct = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      suggestion = `${anotherProduct} ${mealType}`;
    }
    
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
      if (suggestions.length >= 6) break;
    }
  }
  
  // If we still need more suggestions
  while (suggestions.length < 6) {
    if (filteredProducts.length >= 2) {
      const randomProduct1 = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      const randomProduct2 = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      const suggestion = `${randomProduct1} mit ${randomProduct2}`;
      
      if (!suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    } else {
      const basicMeals = ['Pasta', 'Salat', 'Suppe', 'Pfannkuchen', 'Auflauf', 'Eintopf'];
      const randomMeal = basicMeals[Math.floor(Math.random() * basicMeals.length)];
      
      if (filteredProducts.length > 0) {
        const randomProduct = filteredProducts[0];
        const suggestion = `${randomMeal} mit ${randomProduct}`;
        
        if (!suggestions.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      } else {
        suggestions.push(randomMeal);
      }
    }
  }
  
  return suggestions.slice(0, 6);
}
