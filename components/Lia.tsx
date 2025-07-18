
import React, { useState, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import ChatScreen from './ChatScreen.tsx';
import { SpeakerOnIcon, SpeakerOffIcon } from './icons.tsx';

interface LiaProps {
  chat: Chat;
  onReset: () => void;
}

const Lia: React.FC<LiaProps> = ({ chat, onReset }) => {
  const [animationState, setAnimationState] = useState<'intro' | 'chat'>('intro');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to trigger the animation
    const timer = setTimeout(() => {
      setAnimationState('chat');
    }, 2500); // Wait 2.5 seconds before starting the animation to the chat view

    return () => clearTimeout(timer);
  }, []);

  const handleToggleSpeech = useCallback(() => {
    setIsSpeechEnabled(prev => {
        if (prev) { // if it was on, it's being turned off
            window.speechSynthesis.cancel();
        }
        return !prev;
    });
  }, []);
  
  const isIntro = animationState === 'intro';

  return (
    <div 
      className={`h-screen flex flex-col transition-all duration-1000 ease-in-out ${isIntro ? 'justify-center items-center bg-gray-900' : ''}`}
      style={!isIntro ? {
        backgroundImage: "url('https://static.vecteezy.com/system/resources/previews/020/946/183/non_2x/artificial-intelligence-background-free-vector.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      } : {}}
    >
      <header className={`transition-all duration-1000 ease-in-out w-full ${isIntro ? 'flex flex-col items-center' : 'bg-gray-800/50 backdrop-blur-sm p-5 flex justify-between items-center border-b border-gray-700 shadow-md flex-shrink-0'}`}>
        <div className={`flex items-center gap-4 transition-all duration-1000 ease-in-out ${isIntro ? 'flex-col' : 'flex-row'}`}>
          <img 
            src="https://i.imgur.com/9mULEn4.jpeg" 
            alt="Lia's profile" 
            className={`rounded-full object-cover transition-all duration-1000 ease-in-out shadow-2xl ${isIntro ? 'h-56 w-56 border-8 border-purple-400' : 'h-20 w-20 border-2 border-purple-400'}`}
          />
          <div className={`${isIntro ? 'text-center' : 'text-left'}`}>
            <h1 className={`font-bold text-white transition-all duration-1000 ease-in-out ${isIntro ? 'text-7xl mt-4' : 'text-2xl'}`}>Lia</h1>
            {isIntro && (
                <p className="text-5xl font-semibold text-gray-300 mt-6 tracking-wider">
                    ¡Bienvenido!
                </p>
            )}
            <p className={`text-green-400 transition-opacity duration-500 ease-in-out text-base ${isIntro ? 'opacity-0 h-0' : 'opacity-100'}`}>En línea</p>
          </div>
        </div>
        <div className={`flex items-center gap-4 transition-opacity duration-500 delay-500 ease-in-out ${isIntro ? 'opacity-0 h-0' : 'opacity-100'}`}>
          <button onClick={handleToggleSpeech} className="text-white p-3 rounded-full hover:bg-gray-700 transition-colors" aria-label={isSpeechEnabled ? 'Desactivar voz' : 'Activar voz'}>
              {isSpeechEnabled ? <SpeakerOnIcon /> : <SpeakerOffIcon />}
          </button>
          <button 
            onClick={onReset}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-5 text-lg rounded-lg transition-colors"
          >
            Nueva Conversación
          </button>
        </div>
      </header>
      
      <div className={`flex-1 w-full min-h-0 transition-opacity duration-700 ease-in-out delay-500 ${isIntro ? 'opacity-0' : 'opacity-100'}`}>
        {!isIntro && <ChatScreen chat={chat} isSpeechEnabled={isSpeechEnabled} />}
      </div>
    </div>
  );
};

export default Lia;