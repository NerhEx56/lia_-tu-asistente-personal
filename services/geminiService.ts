import { GoogleGenAI, Chat } from "@google/genai";

// --- INSTRUCCIÓN IMPORTANTE ---
// Pega tu API Key de Google Gemini directamente en la siguiente línea.
// RECUERDA: Esto no es seguro para aplicaciones en producción. Cualquiera que
// vea este código podrá usar tu clave. Úsalo solo para desarrollo y pruebas.
const API_KEY = "AIzaSyBncldgks27JPgc6eBgZD2xvekLid8JZKE";


export function createChatSession(systemInstruction: string): Chat {
  if (!API_KEY || API_KEY === "PEGA_AQUÍ_TU_API_KEY") {
      throw new Error("API key no encontrada. Por favor, define tu API_KEY en `services/geminiService.ts`.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-2.5-flash';
  const chat = ai.chats.create({
    model: model,
    config: {
        systemInstruction: systemInstruction,
    }
  });
  return chat;
}
