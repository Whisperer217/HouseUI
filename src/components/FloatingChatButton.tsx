import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
  currentUserId: string;
}

export default function FloatingChatButton({ onClick, currentUserId }: FloatingChatButtonProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewActivity, setHasNewActivity] = useState(false);

  useEffect(() => {
    setUnreadCount(0);
    setHasNewActivity(false);
  }, [currentUserId]);

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 group ${
        hasNewActivity ? 'animate-bounce' : ''
      }`}
    >
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>

        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900">
            <span className="text-white text-xs font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}

        {hasNewActivity && (
          <div className="absolute inset-0 -z-10">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-75"></div>
          </div>
        )}
      </div>

      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          {unreadCount > 0 ? `${unreadCount} new messages` : 'Open Chat'}
        </div>
      </div>
    </button>
  );
}
