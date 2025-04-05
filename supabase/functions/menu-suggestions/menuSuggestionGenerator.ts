
export async function generateMenuSuggestions(
  products: string[], 
  openAiApiKey: string
): Promise<string[]> {
  // Create the list of products for the prompt
  const productsList = products.join(', ');
  
  // Simple prompt for menu suggestions
  const prompt = `Ich habe folgende Lebensmittel: ${productsList}.
Erstelle 6 kreative Menüvorschläge, die ich mit diesen Zutaten (oder einigen davon) kochen könnte.
Antworte nur mit einer Liste von 6 Menüvorschlägen, einer pro Zeile, ohne Nummerierung oder weitere Erklärungen.
`;
  
  console.log("Sending menu suggestions prompt to OpenAI:", prompt);
  
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
    
    // Format the response into individual suggestions
    const aiResponse = data.choices[0].message.content.trim();
    console.log("Generated suggestions:", aiResponse);
    
    // Split the response by newlines to get individual suggestions
    const suggestions = aiResponse.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('-')) // Remove empty lines and bullet points
      .map(line => {
        // Remove numbers at the beginning (e.g. "1. Spaghetti Carbonara" -> "Spaghetti Carbonara")
        return line.replace(/^\d+\.\s*/, '');
      });
    
    console.log(`Generated ${suggestions.length} menu suggestions`);
    
    return suggestions;
  } catch (error) {
    console.error('Error generating menu suggestions:', error);
    throw new Error('Fehler bei der Generierung der Menüvorschläge: ' + error.message);
  }
}
