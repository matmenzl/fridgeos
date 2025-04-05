
export async function generateRecipe(
  dishName: string, 
  openAiApiKey: string, 
  retryAttempt = false
): Promise<string> {
  // Create the prompt for a recipe
  const prompt = `Bitte erstelle ein einfaches Rezept für "${dishName}". 
  Das Rezept sollte folgende Abschnitte enthalten:
  - Zutaten (als Liste)
  - Zubereitungsschritte (nummeriert)
  
  Halte das Rezept kurz und prägnant, maximal 250 Wörter.`;
  
  console.log("Sending recipe prompt to OpenAI:", prompt);
  
  try {
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
    
    // Return the recipe text
    const recipe = data.choices[0].message.content.trim();
    console.log("Generated recipe:", recipe.substring(0, 100) + "...");
    
    return recipe;
  } catch (error) {
    console.error('Error generating recipe:', error);
    if (retryAttempt) {
      throw error; // Don't retry if this is already a retry attempt
    }
    
    // For first attempts, throw with clear message for client-side retry
    throw new Error('Fehler bei der Rezeptgenerierung: ' + error.message);
  }
}
