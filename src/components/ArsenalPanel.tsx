import { useState, useEffect } from 'react';
import { X, ExternalLink, Star, Plus, Wrench } from 'lucide-react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface Tool {
  id: string;
  category_id: string;
  name: string;
  description: string;
  icon_url: string | null;
  url: string;
  embed_type: string;
  is_embeddable: boolean;
  is_favorited?: boolean;
}

interface ArsenalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function ArsenalPanel({ isOpen, onClose, userId }: ArsenalPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [categoriesRes, toolsRes, favoritesRes] = await Promise.all([
        supabase.from('toolkit_categories').select('*').order('sort_order'),
        supabase.from('toolkit_items').select('*').eq('is_active', true),
        supabase.from('toolkit_favorites').select('tool_id').eq('user_id', userId),
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (toolsRes.data) setTools(toolsRes.data);
      if (favoritesRes.data) {
        setFavorites(new Set(favoritesRes.data.map(f => f.tool_id)));
      }
    } catch (error) {
      console.error('Error loading arsenal:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (toolId: string) => {
    try {
      if (favorites.has(toolId)) {
        await supabase
          .from('toolkit_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('tool_id', toolId);

        const newFavorites = new Set(favorites);
        newFavorites.delete(toolId);
        setFavorites(newFavorites);
      } else {
        await supabase
          .from('toolkit_favorites')
          .insert({ user_id: userId, tool_id: toolId });

        setFavorites(new Set([...favorites, toolId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Wrench;
    return Icon;
  };

  const filteredTools = selectedCategory === 'all'
    ? tools
    : selectedCategory === 'favorites'
    ? tools.filter(t => favorites.has(t.id))
    : tools.filter(t => t.category_id === selectedCategory);

  const getEmbedContent = (tool: Tool) => {
    if (tool.embed_type === 'spotify') {
      return (
        <div className="w-full h-80 mt-3">
          <iframe
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="encrypted-media"
            className="rounded-lg"
          />
        </div>
      );
    }
    if (tool.embed_type === 'youtube') {
      return (
        <div className="w-full aspect-video mt-3">
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
          />
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="w-full max-w-2xl bg-gray-900 border-l border-gray-700 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Family Arsenal</h2>
              <p className="text-sm text-gray-400">Your toolkit of apps and services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-4 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All Tools
          </button>
          <button
            onClick={() => setSelectedCategory('favorites')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              selectedCategory === 'favorites'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
            Favorites
          </button>
          {categories.map((cat) => {
            const Icon = getIconComponent(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading arsenal...</p>
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tools in this category</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {tool.icon_url && (
                        <img
                          src={tool.icon_url}
                          alt={tool.name}
                          className="w-12 h-12 object-contain rounded-lg bg-white/5 p-2"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg mb-1">{tool.name}</h3>
                        <p className="text-sm text-gray-400 mb-3">{tool.description}</p>

                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Launch
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          {tool.is_embeddable && (
                            <button
                              onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              {expandedTool === tool.id ? 'Hide' : 'Embed'}
                            </button>
                          )}

                          <button
                            onClick={() => toggleFavorite(tool.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              favorites.has(tool.id)
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${favorites.has(tool.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedTool === tool.id && tool.is_embeddable && getEmbedContent(tool)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-lg font-semibold transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Custom Tool
          </button>
        </div>
      </div>
    </div>
  );
}
