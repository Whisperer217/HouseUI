import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceButtonProps {
  onTranscript?: (text: string) => void;
}

export default function VoiceButton({ onTranscript }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          onTranscript?.(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  return (
    <button
      onClick={toggleListening}
      className="relative group"
      aria-label={isListening ? 'Stop listening' : 'Start voice command'}
    >
      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening
          ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/50'
          : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/50'
      }`}>
        {isListening ? (
          <MicOff className="w-7 h-7 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}

        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full bg-orange-400 animate-pulse" />
          </>
        )}
      </div>

      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <span className={`text-xs font-medium ${isListening ? 'text-orange-400' : 'text-gray-400'}`}>
          {isListening ? 'Listening...' : 'Voice Command'}
        </span>
      </div>
    </button>
  );
}
