
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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
    
    const { products, action } = body;
    
    if (!products) {
      throw new Error('Produkte müssen übergeben werden');
    }
    
    // Der API-Schlüssel wird aus der Umgebungsvariablen gelesen
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAiApiKey) {
      throw new Error('OpenAI API-Schlüssel nicht konfiguriert');
    }

    // Je nach Aktion (Menüvorschläge oder Rezept) wählen wir den richtigen Prompt
    let response;
    
    if (action === 'getRecipe') {
      console.log(`Generating recipe for: "${products}"`);
      if (typeof products !== 'string') {
        throw new Error('Gericht muss als String übergeben werden');
      }
      
      // Erstelle den Prompt für ein Rezept
      const prompt = `Bitte erstelle ein einfaches Rezept für "${products}". 
      Das Rezept sollte folgende Abschnitte enthalten:
      - Zutaten (als Liste)
      - Zubereitungsschritte (nummeriert)
      
      Halte das Rezept kurz und prägnant, maximal 250 Wörter.`;
      
      console.log("Sending recipe prompt to OpenAI:", prompt);
      
      // Rufe die OpenAI API auf
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Koch-Experte, der einfache und leckere Rezepte erstellt.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}`);
      }
      
      const data = await response.json();
      console.log("OpenAI response received for recipe:", data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid response format from OpenAI:", data);
        throw new Error("Ungültiges Antwortformat von OpenAI");
      }
      
      // Für Rezepte gib den Text zurück
      const recipe = data.choices[0].message.content.trim();
      console.log("Generated recipe:", recipe);
      
      return new Response(
        JSON.stringify({ recipe }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'getMenuSuggestions') {
      // Standardaktion: Menüvorschläge generieren
      console.log(`Generating menu suggestions for products: ${JSON.stringify(products)}`);
      
      if (!Array.isArray(products)) {
        throw new Error('Produkte müssen als Array übergeben werden');
      }
      
      // Erstelle den Prompt für ChatGPT
      const productsList = products.join(', ');
      
      // Einfacherer Prompt für Menüvorschläge
      const prompt = `Ich habe folgende Lebensmittel: ${productsList}.
Erstelle 6 kreative Menüvorschläge, die ich mit diesen Zutaten (oder einigen davon) kochen könnte.
Antworte nur mit einer Liste von 6 Menüvorschlägen, einer pro Zeile, ohne Nummerierung oder weitere Erklärungen.
`;
      
      console.log("Sending menu suggestions prompt to OpenAI:", prompt);
      
      // Rufe die OpenAI API auf
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein hilfreicher Kochassistent, der kreative Menüvorschläge basierend auf vorhandenen Zutaten erstellt.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 250
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API Error:', errorData);
        throw new Error(`OpenAI API Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}`);
      }
      
      const data = await response.json();
      console.log("OpenAI response received for menu suggestions:", data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Invalid response format from OpenAI:", data);
        throw new Error("Ungültiges Antwortformat von OpenAI");
      }
      
      // Für Menüvorschläge formatieren wir die Antwort
      const aiResponse = data.choices[0].message.content.trim();
      console.log("Generated suggestions:", aiResponse);
      
      // Teile die Antwort nach Zeilenumbrüchen auf, um einzelne Vorschläge zu erhalten
      const suggestions = aiResponse.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('-')) // Leere Zeilen und Aufzählungszeichen entfernen
        .map(line => {
          // Zahlen am Anfang entfernen (z.B. "1. Spaghetti Carbonara" -> "Spaghetti Carbonara")
          return line.replace(/^\d+\.\s*/, '');
        });
      
      console.log(`Generated ${suggestions.length} menu suggestions`);
      
      // Gib bis zu 6 Vorschläge zurück
      return new Response(
        JSON.stringify({ suggestions: suggestions.slice(0, 6) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Unbekannte Aktion
      return new Response(
        JSON.stringify({ status: "ok" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Fehler:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Ein Fehler ist aufgetreten' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
