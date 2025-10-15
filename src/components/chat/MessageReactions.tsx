import { useState } from 'react';
import { Smile, Plus } from 'lucide-react';

interface MessageReactionsProps {
  reactions: Record<string, string[]>;
  currentUserId: string;
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉', '🚀', '👀', '🔥', '💯'];

export default function MessageReactions({
  reactions,
  currentUserId,
  onAddReaction,
  onRemoveReaction,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const hasReacted = (emoji: string) => {
    return reactions[emoji]?.includes(currentUserId) || false;
  };

  const toggleReaction = (emoji: string) => {
    if (hasReacted(emoji)) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
    setShowPicker(false);
  };

  const reactionEntries = Object.entries(reactions).filter(([_, users]) => users.length > 0);

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {reactionEntries.map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
            hasReacted(emoji)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span>{emoji}</span>
          <span className="text-xs">{users.length}</span>
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
          title="Add reaction"
        >
          <Smile className="w-4 h-4" />
        </button>

        {showPicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20">
              <div className="grid grid-cols-4 gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => toggleReaction(emoji)}
                    className={`text-2xl p-2 rounded hover:bg-gray-700 transition-colors ${
                      hasReacted(emoji) ? 'bg-blue-600' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
