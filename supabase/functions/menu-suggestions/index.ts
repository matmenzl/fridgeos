
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
    const { products, action } = await req.json();
    
    if (!products || !Array.isArray(products)) {
      throw new Error('Produkte müssen als Array übergeben werden');
    }
    
    // Der API-Schlüssel wird aus der Umgebungsvariablen gelesen
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAiApiKey) {
      throw new Error('OpenAI API-Schlüssel nicht konfiguriert');
    }

    // Je nach Aktion (Menüvorschläge oder Rezept) wählen wir den richtigen Prompt
    let response;
    
    if (action === 'getRecipe') {
      if (!products || typeof products !== 'string') {
        throw new Error('Gericht muss als String übergeben werden');
      }
      
      // Erstelle den Prompt für ein Rezept
      const prompt = `Bitte erstelle ein einfaches Rezept für "${products}". 
      Das Rezept sollte folgende Abschnitte enthalten:
      - Zutaten (als Liste)
      - Zubereitungsschritte (nummeriert)
      
      Halte das Rezept kurz und prägnant, maximal 250 Wörter.`;
      
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
    } else {
      // Standardaktion: Menüvorschläge generieren
      // Erstelle den Prompt für ChatGPT
      const productsList = products.join(', ');
      
      const prompt = `Du bist ein Koch-Experte und sollst Menüvorschläge basierend auf den folgenden Zutaten erstellen:
      
      ${productsList}
      
      Bitte erstelle 6 kreative Menüvorschläge (oder weniger, wenn nicht genug Zutaten vorhanden sind). 
      Jeder Vorschlag sollte kurz sein (maximal 3-4 Wörter) und auf Deutsch.
      Gib nur die Menüvorschläge zurück, einer pro Zeile, ohne Nummerierung oder andere Texte.`;
      
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
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Fehler: ${errorData.error?.message || 'Unbekannter Fehler'}`);
    }
    
    const data = await response.json();
    
    if (action === 'getRecipe') {
      // Für Rezepte gib den Text zurück
      const recipe = data.choices[0].message.content.trim();
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
