import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';

interface ProjectInteractionsProps {
  projectId: string;
  userId: string;
}

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  comment: string;
  reaction: string | null;
  created_at: string;
}

export default function ProjectInteractions({ projectId, userId }: ProjectInteractionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = () => {
    const favKey = `project_favorites_${projectId}`;
    const commentsKey = `project_comments_${projectId}`;
    const userFavKey = `user_favorite_${userId}_${projectId}`;

    const savedFavCount = localStorage.getItem(favKey);
    const savedComments = localStorage.getItem(commentsKey);
    const savedUserFav = localStorage.getItem(userFavKey);

    setFavoriteCount(savedFavCount ? parseInt(savedFavCount) : 0);
    setComments(savedComments ? JSON.parse(savedComments) : []);
    setIsFavorited(savedUserFav === 'true');
  };

  const toggleFavorite = () => {
    const favKey = `project_favorites_${projectId}`;
    const userFavKey = `user_favorite_${userId}_${projectId}`;

    if (isFavorited) {
      const newCount = Math.max(0, favoriteCount - 1);
      setFavoriteCount(newCount);
      setIsFavorited(false);
      localStorage.setItem(favKey, newCount.toString());
      localStorage.removeItem(userFavKey);
    } else {
      const newCount = favoriteCount + 1;
      setFavoriteCount(newCount);
      setIsFavorited(true);
      localStorage.setItem(favKey, newCount.toString());
      localStorage.setItem(userFavKey, 'true');
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const profiles = JSON.parse(localStorage.getItem('family_profiles') || '[]');
    const currentUser = profiles.find((p: any) => p.id === userId);

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      user_id: userId,
      user_name: currentUser?.name || 'User',
      comment: newComment.trim(),
      reaction: null,
      created_at: new Date().toISOString(),
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    setNewComment('');

    const commentsKey = `project_comments_${projectId}`;
    localStorage.setItem(commentsKey, JSON.stringify(updatedComments));
  };

  const addReaction = (reaction: string) => {
    const profiles = JSON.parse(localStorage.getItem('family_profiles') || '[]');
    const currentUser = profiles.find((p: any) => p.id === userId);

    const reactionComment: Comment = {
      id: `reaction-${Date.now()}`,
      user_id: userId,
      user_name: currentUser?.name || 'User',
      comment: '',
      reaction,
      created_at: new Date().toISOString(),
    };

    const updatedComments = [reactionComment, ...comments];
    setComments(updatedComments);

    const commentsKey = `project_comments_${projectId}`;
    localStorage.setItem(commentsKey, JSON.stringify(updatedComments));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isFavorited
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{favoriteCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{comments.length}</span>
        </button>

        <div className="flex gap-1">
          {['👍', '❤️', '🎉', '🔥'].map((emoji) => (
            <button
              key={emoji}
              onClick={() => addReaction(emoji)}
              className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-lg"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {showComments && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addComment()}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 bg-gray-700 text-white placeholder-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addComment}
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-700/50 rounded-lg p-3">
                {comment.reaction ? (
                  <div className="text-2xl">{comment.reaction}</div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-1">
                      {comment.user_name}
                    </p>
                    <p className="text-sm text-white">{comment.comment}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
