import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProjectInteractionsProps {
  projectId: string;
  userId: string;
}

interface Comment {
  id: string;
  user_id: string;
  comment: string;
  reaction: string | null;
  created_at: string;
  profiles?: {
    name: string;
  };
}

export default function ProjectInteractions({ projectId, userId }: ProjectInteractionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadFavorites();
    loadComments();
  }, [projectId]);

  const loadFavorites = async () => {
    try {
      const { count } = await supabase
        .from('project_favorites')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      setFavoriteCount(count || 0);

      const { data } = await supabase
        .from('project_favorites')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadComments = async () => {
    try {
      const { data } = await supabase
        .from('project_comments')
        .select(`
          *,
          profiles (
            name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await supabase
          .from('project_favorites')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', userId);

        setIsFavorited(false);
        setFavoriteCount(favoriteCount - 1);
      } else {
        await supabase
          .from('project_favorites')
          .insert({ project_id: projectId, user_id: userId });

        setIsFavorited(true);
        setFavoriteCount(favoriteCount + 1);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: userId,
          comment: newComment.trim(),
        });

      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const addReaction = async (reaction: string) => {
    try {
      await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: userId,
          reaction,
        });

      loadComments();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
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
                      {comment.profiles?.name || 'Unknown'}
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
