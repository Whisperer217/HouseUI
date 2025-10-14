import { Gamepad2, Smartphone, FileText, Palette } from 'lucide-react';

interface QuickCreateBarProps {
  onCreateClick: (type: string) => void;
}

export default function QuickCreateBar({ onCreateClick }: QuickCreateBarProps) {
  const createOptions = [
    { type: 'game', label: 'New Game', icon: Gamepad2, gradient: 'from-violet-500 to-purple-600' },
    { type: 'app', label: 'New App', icon: Smartphone, gradient: 'from-blue-500 to-cyan-600' },
    { type: 'story', label: 'New Story', icon: FileText, gradient: 'from-emerald-500 to-teal-600' },
    { type: 'art', label: 'New Art', icon: Palette, gradient: 'from-pink-500 to-rose-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {createOptions.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.type}
            onClick={() => onCreateClick(option.type)}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${option.gradient} p-4 sm:p-6 hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative flex flex-col items-center space-y-2">
              <Icon className="w-8 h-8 text-white" />
              <span className="text-white font-semibold text-sm sm:text-base">{option.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
