import { GoogleGenAI, Chat } from "@google/genai";

export function createChatSession(systemInstruction: string): Chat {
  if (!process.env.AIzaSyBncldgks27JPgc6eBgZD2xvekLid8JZKE) {
      throw new Error("API key not found. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.AIzaSyBncldgks27JPgc6eBgZD2xvekLid8JZKE });
  const model = 'gemini-2.5-flash';
  const chat = ai.chats.create({
    model: model,
    config: {
        systemInstruction: systemInstruction,
    }
  });
  return chat;
}
