import { GoogleGenAI, Chat } from "@google/genai";

export function createChatSession(systemInstruction: string): Chat {
  if (!process.env.API_KEY) {
      throw new Error("API key not found. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';
  const chat = ai.chats.create({
    model: model,
    config: {
        systemInstruction: systemInstruction,
    }
  });
  return chat;
}
