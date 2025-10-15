import { useState, useEffect } from 'react';
import { X, Palette, Check } from 'lucide-react';
import { themeService } from '../services/themeService';
import { Theme } from '../types/theme';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onThemeChange: (theme: Theme) => void;
}

export default function ThemeSelector({
  isOpen,
  onClose,
  userId,
  onThemeChange,
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadThemes();
    }
  }, [isOpen]);

  const loadThemes = () => {
    const allThemes = themeService.getAllThemes();
    const current = themeService.getCurrentTheme();
    setThemes(allThemes);
    setCurrentTheme(current);
  };

  const handleSelectTheme = async (theme: Theme) => {
    setIsSaving(true);
    try {
      await themeService.saveUserTheme(userId, theme.id);
      setCurrentTheme(theme);
      onThemeChange(theme);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving theme:', error);
      setIsSaving(false);
      alert('Failed to save theme. Using local preference.');
      themeService.setTheme(theme.id);
      setCurrentTheme(theme);
      onThemeChange(theme);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Choose Your Theme</h2>
              <p className="text-sm text-gray-400">Personalize your creative space</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                disabled={isSaving}
                className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  currentTheme?.id === theme.id
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div
                  className={`${theme.background} rounded-lg h-32 mb-3 flex items-center justify-center relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className={`${theme.cardBg} ${theme.cardBorder} border rounded-lg p-3`}>
                    <div className={`text-xs ${theme.textPrimary} font-bold mb-1`}>
                      Sample Card
                    </div>
                    <div className={`text-xs ${theme.textSecondary}`}>Preview text</div>
                    <div
                      className={`mt-2 px-2 py-1 rounded bg-gradient-to-r ${theme.accent} text-white text-xs`}
                    >
                      Button
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="text-left">
                    <h3 className="text-white font-semibold">{theme.name}</h3>
                    <p className="text-gray-400 text-xs">{theme.description}</p>
                  </div>
                  {currentTheme?.id === theme.id && (
                    <div className="p-1 bg-blue-500 rounded-full">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 text-center">
            Your theme is saved automatically and syncs across all your devices
          </p>
        </div>
      </div>
    </div>
  );
}
