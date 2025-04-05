
import OpenAI from "https://deno.land/x/openai@v4.16.1/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Generate menu suggestions with OpenAI
export async function generateMenuSuggestionsWithOpenAI(products: string[]): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not available");
  }

  const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  const uniqueProducts = [...new Set(products)].filter(product => product && product.trim().length > 0);
  
  const prompt = `
Ich habe folgende Lebensmittel: ${uniqueProducts.join(', ')}.
Erstelle 6 kreative Menüvorschläge, die ich mit diesen Zutaten (oder einigen davon) kochen könnte.
Antworte nur mit einer Liste von 6 Menüvorschlägen, einer pro Zeile, ohne Nummerierung oder weitere Erklärungen.
`;

  try {
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
    
    if (suggestions.length === 0) {
      throw new Error("Keine Vorschläge von OpenAI erhalten");
    }
    
    return suggestions;
  } catch (error) {
    console.error("Error calling OpenAI for menu suggestions:", error);
    throw error;
  }
}

// Generate recipe with OpenAI
export async function generateRecipeWithOpenAI(menuSuggestion: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not available");
  }

  try {
    console.log("Creating OpenAI client for recipe generation");
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    const prompt = `
Erstelle ein detailliertes Rezept für "${menuSuggestion}". 
Bitte gib Zutaten und Zubereitungsschritte an.
`;

    console.log("Sending recipe prompt to OpenAI:", prompt);
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein erfahrener Koch, der hilfreiche und detaillierte Rezepte schreibt." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    console.log("OpenAI response received");
    const recipe = chatCompletion.choices[0].message.content;
    
    if (!recipe || recipe.trim().length === 0) {
      console.error("Empty recipe received from OpenAI");
      throw new Error("Leeres Rezept von OpenAI erhalten");
    }
    
    console.log("Recipe content length:", recipe.length);
    return recipe;
  } catch (error) {
    console.error("Error calling OpenAI for recipe:", error);
    throw new Error("Rezept konnte nicht generiert werden: " + (error instanceof Error ? error.message : "Unbekannter Fehler"));
  }
}
