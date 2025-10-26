
import { GoogleGenAI } from "@google/genai";

// Fix: Simplified API client initialization to follow guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRouteInfo = async (originCode: string, destinationCode: string): Promise<string> => {
  try {
    const prompt = `خلاصه‌ای کوتاه و جالب برای مسیر پروازی بین فرودگاه ${originCode} و ${destinationCode} ارائه بده. به یک یا دو نقطه عطف جغرافیایی، اقیانوس یا شهر معروفی که در طول مسیر ممکن است دیده شود، اشاره کن. خلاصه را در ۲ تا ۴ جمله نگه دار و لحنی مناسب برای یک علاقه‌مند به سفر داشته باش. پاسخ حتما به زبان فارسی باشد.`;
    
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