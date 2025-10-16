import { useState, useEffect } from 'react';
import { X, ExternalLink, Star, Wrench, Code, Palette, Music, BookOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

interface Tool {
  id: string;
  category_id: string;
  name: string;
  description: string;
  url: string;
}

interface ArsenalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'coding', name: 'Coding', icon: Code, color: '#3b82f6' },
  { id: 'design', name: 'Design', icon: Palette, color: '#ec4899' },
  { id: 'music', name: 'Music', icon: Music, color: '#10b981' },
  { id: 'learning', name: 'Learning', icon: BookOpen, color: '#f59e0b' },
];

const DEFAULT_TOOLS: Tool[] = [
  {
    id: '1',
    category_id: 'coding',
    name: 'Scratch',
    description: 'Visual programming for beginners',
    url: 'https://scratch.mit.edu',
  },
  {
    id: '2',
    category_id: 'coding',
    name: 'CodePen',
    description: 'HTML, CSS, JS playground',
    url: 'https://codepen.io',
  },
  {
    id: '3',
    category_id: 'design',
    name: 'Canva',
    description: 'Easy graphic design tool',
    url: 'https://canva.com',
  },
  {
    id: '4',
    category_id: 'design',
    name: 'Figma',
    description: 'Professional design tool',
    url: 'https://figma.com',
  },
  {
    id: '5',
    category_id: 'music',
    name: 'Beepbox',
    description: 'Create chiptune music',
    url: 'https://beepbox.co',
  },
  {
    id: '6',
    category_id: 'learning',
    name: 'Khan Academy',
    description: 'Free learning for everyone',
    url: 'https://khanacademy.org',
  },
];

export default function ArsenalPanel({ isOpen, onClose, userId }: ArsenalPanelProps) {
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [tools] = useState<Tool[]>(DEFAULT_TOOLS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen && userId) {
      const saved = localStorage.getItem(`favorites_${userId}`);
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    }
  }, [isOpen, userId]);

  const toggleFavorite = (toolId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(toolId)) {
      newFavorites.delete(toolId);
    } else {
      newFavorites.add(toolId);
    }
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${userId}`, JSON.stringify([...newFavorites]));
  };

  const filteredTools = selectedCategory === 'all'
    ? tools
    : selectedCategory === 'favorites'
    ? tools.filter(t => favorites.has(t.id))
    : tools.filter(t => t.category_id === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Family Arsenal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Wrench className="w-5 h-5" />
                <span className="font-medium">All Tools</span>
              </button>
              <button
                onClick={() => setSelectedCategory('favorites')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  selectedCategory === 'favorites'
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Star className="w-5 h-5" />
                <span className="font-medium">Favorites</span>
              </button>
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    <span className="font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tools found</p>
                </div>
              ) : (
                filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-gray-900 rounded-xl border border-gray-700 p-4 hover:border-blue-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white">{tool.name}</h3>
                      <button
                        onClick={() => toggleFavorite(tool.id)}
                        className={`p-1 rounded transition-colors ${
                          favorites.has(tool.id)
                            ? 'text-yellow-400'
                            : 'text-gray-500 hover:text-yellow-400'
                        }`}
                      >
                        <Star
                          className="w-5 h-5"
                          fill={favorites.has(tool.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{tool.description}</p>
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Tool
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
