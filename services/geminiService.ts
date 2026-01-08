
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function processNewsContent(input: string, isUrl: boolean) {
  // Usamos o modelo flash para rapidez e baixo custo em sumarização
  const model = 'gemini-3-flash-preview';
  
  const prompt = isUrl 
    ? `Extract and summarize the news article from this URL: ${input}. 
       Format the response as a JSON object with: title (very short and punchy), subtitle, summary (max 250 chars), and a placeholder imageUrl.`
    : `Summarize the following text into a journalistic news post for Instagram. 
       Text: ${input}.
       Format the response as a JSON object with: title (catchy), subtitle, summary (max 250 chars), and a placeholder imageUrl.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          summary: { type: Type.STRING },
          imageUrl: { type: Type.STRING }
        },
        required: ["title", "subtitle", "summary"]
      },
      tools: isUrl ? [{ googleSearch: {} }] : []
    }
  });

  try {
    const data = JSON.parse(response.text);
    // Imagem padrão caso a IA não retorne uma válida
    if (!data.imageUrl || data.imageUrl.includes('placeholder')) {
      data.imageUrl = `https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=1080`;
    }
    return data;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Não foi possível processar o texto automaticamente.");
  }
}
