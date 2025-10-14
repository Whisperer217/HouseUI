import { Gamepad2, Smartphone, FileText, Palette } from 'lucide-react';

interface QuickCreateBarProps {
  onCreateClick: (type: string) => void;
}

export default function QuickCreateBar({ onCreateClick }: QuickCreateBarProps) {
  const createOptions = [
    { type: 'game', label: 'New Game', icon: Gamepad2, gradient: 'from-purple-600 to-purple-700', bgColor: 'bg-purple-600' },
    { type: 'app', label: 'New App', icon: Smartphone, gradient: 'from-blue-600 to-blue-700', bgColor: 'bg-blue-600' },
    { type: 'story', label: 'New Story', icon: FileText, gradient: 'from-green-600 to-green-700', bgColor: 'bg-green-600' },
    { type: 'art', label: 'New Art', icon: Palette, gradient: 'from-pink-600 to-pink-700', bgColor: 'bg-pink-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {createOptions.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.type}
            onClick={() => onCreateClick(option.type)}
            className={`group relative overflow-hidden rounded-2xl ${option.bgColor} p-8 hover:scale-[1.02] transition-all duration-200 shadow-xl hover:shadow-2xl`}
          >
            <div className="flex flex-col items-center space-y-3">
              <Icon className="w-10 h-10 text-white" />
              <span className="text-white font-bold text-base">{option.label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
