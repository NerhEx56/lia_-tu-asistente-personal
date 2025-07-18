
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { UserIcon, SendIcon, MicrophoneIcon } from './icons.tsx';
import type { Message } from '../types.ts';

// Web Speech API interfaces might not be in standard TS libs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface ChatScreenProps {
  chat: Chat;
  isSpeechEnabled: boolean;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ chat, isSpeechEnabled }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };
    
    // The 'voiceschanged' event is fired when the list of voices has been loaded.
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    loadVoices(); // For browsers that load voices synchronously.

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSpeechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Set language for the text content

    const spanishVoices = voices.filter(voice => voice.lang.startsWith('es-'));

    if (spanishVoices.length === 0) {
        console.warn("No se encontraron voces en español. Usando la voz predeterminada del navegador.");
        window.speechSynthesis.speak(utterance);
        return;
    }

    const femaleVoiceKeywords = [
        'female', 'mujer', 'femenina', 'mónica', 'paulina', 'helena', 
        'laura', 'isabela', 'isabella', 'carmen', 'soledad', 'francisca', 
        'google español',
        'microsoft sabina', 'microsoft helena'
    ];

    let selectedVoice = spanishVoices.find(voice => 
        femaleVoiceKeywords.some(keyword => voice.name.toLowerCase().includes(keyword))
    );

    if (!selectedVoice) {
        const preferredLocales = ['es-MX', 'es-US', 'es-ES'];
        for (const locale of preferredLocales) {
            const voiceForLocale = spanishVoices.find(voice => voice.lang === locale);
            if (voiceForLocale) {
                selectedVoice = voiceForLocale;
                break;
            }
        }
    }

    if (!selectedVoice) {
        selectedVoice = spanishVoices[0];
    }
    
    utterance.voice = selectedVoice || null;
    window.speechSynthesis.speak(utterance);
  }, [isSpeechEnabled, voices]);

  const submitMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    if (isListening) {
      recognitionRef.current?.stop();
    }
    setIsListening(false);
    window.speechSynthesis.cancel();

    const userInput: Message = { id: Date.now().toString(), text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userInput]);
    setIsLoading(true);
    setError(null);
    
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);

    try {
      const stream = await chat.sendMessageStream({ message: messageText });
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }
      speak(fullResponse);

    } catch (err) {
      console.error(err);
      const errorMessage = 'Lo siento, ocurrió un error al contactar al AI. Por favor, intenta de nuevo.';
      setError(errorMessage);
       setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
        ));
      speak(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isListening, chat, speak]);

  const submitMessageRef = useRef(submitMessage);
  useEffect(() => {
    submitMessageRef.current = submitMessage;
  }, [submitMessage]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (transcript.trim()) {
        submitMessageRef.current(transcript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };
    
    recognitionRef.current = recognition;
  }, []);

  const handleToggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          setInput('');
          recognitionRef.current.start();
          setIsListening(true);
      }
  };


  useEffect(() => {
    const welcomeMessage = '¡Hola Andres! ¿en que puedo ayudarte ahora?';
    setMessages([
      {
        id: 'initial-bot-message',
        text: welcomeMessage,
        sender: 'ai',
      }
    ]);
    setTimeout(() => speak(welcomeMessage), 1000);
  }, [chat, speak]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    submitMessage(input);
    setInput('');
  }, [input, isLoading, submitMessage]);

  return (
    <div className="flex flex-col h-full">
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && (
              <img src="https://i.imgur.com/9mULEn4.jpeg" alt="Lia's profile" className="flex-shrink-0 h-14 w-14 rounded-full shadow-lg object-cover" />
            )}
            <div className={`max-w-2xl p-4 rounded-2xl shadow-md text-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {isLoading && msg.sender === 'ai' && index === messages.length - 1 && (
                  <div className="animate-pulse flex space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  </div>
              )}
            </div>
             {msg.sender === 'user' && (
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center shadow-lg">
                <UserIcon />
              </div>
            )}
          </div>
        ))}
        {error && !isLoading && (
            <div className="text-red-400 text-center">{error}</div>
        )}
      </main>

      <footer className="p-4 bg-gray-900/70 backdrop-blur-sm border-t border-gray-800/50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 md:space-x-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Escuchando..." : "Escribe o pulsa el micrófono..."}
            disabled={isLoading}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-full py-4 px-6 text-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleToggleListening}
            disabled={isLoading}
            className={`p-4 rounded-full text-white transition-all duration-200 transform hover:scale-110 ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-600 hover:bg-gray-700'}`}
            aria-label={isListening ? 'Dejar de escuchar' : 'Empezar a escuchar'}
          >
            <MicrophoneIcon />
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110"
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatScreen;