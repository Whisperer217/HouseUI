import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  type: string;
  thumbnail_url: string | null;
}

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

export default function TemplatesModal({ isOpen, onClose, onSelectTemplate }: TemplatesModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = () => {
    try {
      setLoading(true);
      const defaultTemplates: Template[] = [
        {
          id: '1',
          title: 'Platformer Game',
          description: 'A classic side-scrolling platformer with power-ups and enemies',
          type: 'game',
          thumbnail_url: null,
        },
        {
          id: '2',
          title: 'Todo App',
          description: 'A simple task management application',
          type: 'app',
          thumbnail_url: null,
        },
        {
          id: '3',
          title: 'Adventure Story',
          description: 'An interactive choose-your-own-adventure story',
          type: 'story',
          thumbnail_url: null,
        },
        {
          id: '4',
          title: 'Digital Art Gallery',
          description: 'Showcase your artwork in a beautiful gallery',
          type: 'art',
          thumbnail_url: null,
        },
      ];
      setTemplates(defaultTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Project Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No templates available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-all hover:scale-105"
                >
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    {template.thumbnail_url ? (
                      <img
                        src={template.thumbnail_url}
                        alt={template.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                      {template.type}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-white text-left mb-1 group-hover:text-blue-400 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-gray-400 text-left line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
