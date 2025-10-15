import CodeBlock from './CodeBlock';
import { Play, Pause } from 'lucide-react';
import { useState, useRef } from 'react';

interface MessageContentProps {
  content: string;
  messageType: string;
  codeLanguage?: string | null;
  voiceDuration?: number | null;
  voiceUrl?: string | null;
}

export default function MessageContent({
  content,
  messageType,
  codeLanguage,
  voiceDuration,
  voiceUrl,
}: MessageContentProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parseMessage = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: JSX.Element[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        parts.push(
          <span key={`text-${keyIndex++}`} className="whitespace-pre-wrap">
            {textBefore}
          </span>
        );
      }

      const language = match[1] || 'text';
      const code = match[2].trim();
      parts.push(<CodeBlock key={`code-${keyIndex++}`} code={code} language={language} />);

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const textAfter = text.slice(lastIndex);
      parts.push(
        <span key={`text-${keyIndex++}`} className="whitespace-pre-wrap">
          {textAfter}
        </span>
      );
    }

    return parts.length > 0 ? parts : <span className="whitespace-pre-wrap">{text}</span>;
  };

  const togglePlayPause = () => {
    if (!audioRef.current && voiceUrl) {
      audioRef.current = new Audio(voiceUrl);
      audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
    } else if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (messageType === 'voice' && voiceUrl) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg">
        <button
          onClick={togglePlayPause}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white" />
          )}
        </button>
        <div className="flex-1">
          <div className="h-1 bg-gray-700 rounded-full">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }} />
          </div>
        </div>
        <span className="text-sm text-gray-400 font-mono">
          {voiceDuration ? formatDuration(voiceDuration) : '0:00'}
        </span>
      </div>
    );
  }

  if (messageType === 'code' && codeLanguage) {
    return <CodeBlock code={content} language={codeLanguage} />;
  }

  return <div>{parseMessage(content)}</div>;
}
