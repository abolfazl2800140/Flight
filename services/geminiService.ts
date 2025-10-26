import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getRouteInfo = async (origin: string, destination: string): Promise<string> => {
  try {
    const prompt = `یک توضیح کوتاه و جالب در مورد مسیر هوایی بین فرودگاه ${origin} و ${destination} به زبان فارسی ارائه بده.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Failed to communicate with the Gemini API.", error);
    throw error;
  }
};

const assistantChat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: 'شما یک دستیار هوش مصنوعی متخصص در حوزه هوانوردی و پرواز هستید. به سوالات کاربران به زبان فارسی، با لحنی دوستانه و مفید پاسخ دهید.',
  },
});

export const getAssistantResponse = async (message: string): Promise<string> => {
    try {
        const response = await assistantChat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Failed to get assistant response from Gemini API.", error);
        return "متاسفانه در حال حاضر قادر به پاسخگویی نیستم. لطفاً بعداً دوباره تلاش کنید.";
    }
};
