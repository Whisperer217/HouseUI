import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const playAudio = () => {
    if (audioBlob && !isPlaying) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
    } else if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      setAudioBlob(null);
      setDuration(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-gray-800 border-t border-gray-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          {!audioBlob ? (
            <>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                >
                  <Mic className="w-6 h-6 text-white" />
                </button>
              ) : (
                <>
                  <button
                    onClick={stopRecording}
                    className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                  >
                    <Square className="w-6 h-6 text-white" />
                  </button>
                  {!isPaused ? (
                    <button
                      onClick={pauseRecording}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    >
                      <Pause className="w-5 h-5 text-white" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeRecording}
                      className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                    >
                      <Play className="w-5 h-5 text-white" />
                    </button>
                  )}
                </>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`} />
                  <span className="text-white font-mono text-lg">{formatTime(duration)}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {isRecording
                    ? isPaused
                      ? 'Recording paused'
                      : 'Recording...'
                    : 'Click microphone to start recording'}
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={playAudio}
                className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-white font-mono text-lg">{formatTime(duration)}</span>
                </div>
                <p className="text-sm text-gray-400">Voice message ready to send</p>
              </div>

              <button
                onClick={deleteRecording}
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={handleSend}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full transition-all"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
