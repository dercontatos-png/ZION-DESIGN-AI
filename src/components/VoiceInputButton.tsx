import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
    }
  }, []);

  if (!supported) return null;

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR'; // Brazilian Portuguese
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startListening}
      className={`p-1.5 rounded-lg transition-all flex items-center justify-center shrink-0 ${
        isListening 
          ? 'bg-red-500/20 text-red-500 animate-pulse border border-red-500/30' 
          : 'bg-zinc-800/40 border border-white/5 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800'
      } ${className}`}
      title={isListening ? "Ouvindo... Fale agora." : "Digitar por voz"}
    >
      {isListening ? (
        <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          Ouvindo
        </span>
      ) : (
        <Mic size={14} />
      )}
    </button>
  );
};
