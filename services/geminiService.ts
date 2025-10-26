
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getRouteInfo = async (origin: string, destination: string): Promise<string> => {
  try {
    const prompt = `Provide a brief and interesting summary for a flight from ${origin} to ${destination}. Mention one or two major geographical landmarks, oceans, or famous cities one might see along the way. Keep the summary to 2-4 sentences and adopt a tone suitable for a travel enthusiast.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini API.");
    }

    return text;
  } catch (error) {
    console.error("Error fetching route info from Gemini:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};
