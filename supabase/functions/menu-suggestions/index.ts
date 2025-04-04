
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
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body:", JSON.stringify(requestBody));
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { products, action } = requestBody;
    
    // Validate request body based on action
    if (action === 'getRecipe') {
      if (!products || typeof products !== 'string') {
        console.error('Invalid request for getRecipe, products:', products);
        return new Response(
          JSON.stringify({ error: 'Gericht muss als String übergeben werden' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // For other actions, products should be an array
      if (!products || !Array.isArray(products)) {
        console.error('Invalid request for menu suggestions, products:', products);
        return new Response(
          JSON.stringify({ error: 'Produkte müssen als Array übergeben werden' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Der API-Schlüssel wird aus der Umgebungsvariablen gelesen
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API-Schlüssel nicht konfiguriert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Je nach Aktion (Menüvorschläge oder Rezept) wählen wir den richtigen Prompt
    let response;
    
    if (action === 'getRecipe') {
      console.log(`Generating recipe for: "${products}"`);
      
      // Erstelle den Prompt für ein Rezept
      const prompt = `Bitte erstelle ein einfaches Rezept für "${products}". 
      Das Rezept sollte folgende Abschnitte enthalten:
      - Zutaten (als Liste)
      - Zubereitungsschritte (nummeriert)
      
      Halte das Rezept kurz und prägnant, maximal 250 Wörter.`;
      
      // Rufe die OpenAI API auf
      try {
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
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return new Response(
          JSON.stringify({ error: `Fehler beim Aufrufen der OpenAI API: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Standardaktion: Menüvorschläge generieren
      console.log(`Generating menu suggestions for products:`, products);
      
      // Erstelle den Prompt für ChatGPT
      const productsList = products.join(', ');
      
      const prompt = `Du bist ein Koch-Experte und sollst Menüvorschläge basierend auf den folgenden Zutaten erstellen:
      
      ${productsList}
      
      Bitte erstelle 6 kreative Menüvorschläge (oder weniger, wenn nicht genug Zutaten vorhanden sind). 
      Jeder Vorschlag sollte kurz sein (maximal 3-4 Wörter) und auf Deutsch.
      Gib nur die Menüvorschläge zurück, einer pro Zeile, ohne Nummerierung oder andere Texte.`;
      
      // Rufe die OpenAI API auf
      try {
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
                content: 'Du bist ein hilfreicher Assistent, der kreative Menüvorschläge basierend auf vorhandenen Zutaten erstellt.'
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
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return new Response(
          JSON.stringify({ error: `Fehler beim Aufrufen der OpenAI API: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return new Response(
        JSON.stringify({ error: `OpenAI API Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = await response.json();
    
    if (action === 'getRecipe') {
      // Für Rezepte gib den Text zurück
      const recipe = data.choices[0].message.content.trim();
      console.log(`Recipe generated successfully, length: ${recipe.length} chars`);
      return new Response(
        JSON.stringify({ recipe }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Für Menüvorschläge formatieren wir die Antwort
      const aiResponse = data.choices[0].message.content.trim();
      
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
