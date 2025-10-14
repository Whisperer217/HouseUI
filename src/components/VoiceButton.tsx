import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceButton() {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    setIsListening(!isListening);
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
