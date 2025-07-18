
import React, { useState } from 'react';
import { SparklesIcon } from './icons.tsx';

interface SetupScreenProps {
  onStartChat: (systemInstruction: string) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartChat }) => {
  const [instruction, setInstruction] = useState('');

  const handleStart = () => {
    onStartChat(instruction || 'Eres un asistente útil y amigable.');
  };
  
  const placeholderText = `Define la personalidad o el contexto de tu chatbot. Por ejemplo:
- Eres un experto en historia romana.
- Eres un chef que da recetas veganas.
- Hablas como un pirata.
- Responde solo con emojis.

Si lo dejas en blanco, seré un asistente general.`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        <div className="flex justify-center items-center mb-6">
            <SparklesIcon />
            <h1 className="text-4xl font-bold ml-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                Crea tu Chatbot
            </h1>
        </div>
        <p className="text-gray-300 mb-6">
          Dale una personalidad o un rol a tu chatbot para empezar. Esto guiará sus respuestas.
        </p>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={placeholderText}
          className="w-full h-48 p-4 bg-gray-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-gray-200 placeholder-gray-500"
        />
        <button
          onClick={handleStart}
          className="mt-6 w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
        >
          Comenzar a Chatear
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;