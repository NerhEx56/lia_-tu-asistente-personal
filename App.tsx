
import React, { useState, useCallback, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession } from './services/geminiService.ts';
import Lia from './components/Lia.tsx';

const SYSTEM_INSTRUCTION = 'Tu nombre es Lia. Eres una asistente de IA conversacional. Estás chateando con Andres, un programador de 30 años. Háblale de manera informal y amigable, como si fueras una amiga. Tu propósito es ayudarlo con sus preguntas y tareas de la forma más completa y precisa posible. No utilices asteriscos para dar formato al texto (como negritas o cursivas) y no incluyas emojis en tus respuestas.';

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chat) {
        try {
          setError(null);
          const newChat = createChatSession(SYSTEM_INSTRUCTION);
          setChat(newChat);
        } catch (e) {
          console.error("Failed to initialize chat:", e);
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError("Ocurrió un error desconocido al configurar el chat.");
          }
        }
    }
  }, [chat]);

  const handleReset = useCallback(() => {
    setChat(null);
  }, []);

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-center">
            <div className="bg-red-900/50 border border-red-500 p-8 rounded-lg">
                <h1 className="text-2xl font-bold text-red-300 mb-4">Error de Configuración</h1>
                <p className="text-red-200">{error}</p>
                <p className="text-gray-400 mt-4 text-sm">Por favor, asegúrate de que la variable de entorno API_KEY esté configurada correctamente y recarga la página.</p>
            </div>
        </div>
    );
  }

  if (!chat) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
            </div>
            <p className="mt-4 text-gray-300">Iniciando a Lia...</p>
        </div>
    );
  }

  return (
    <Lia chat={chat} onReset={handleReset} />
  );
};

export default App;