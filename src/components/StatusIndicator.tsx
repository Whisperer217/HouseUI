import { AIStatus } from '../types';
import { Circle } from 'lucide-react';

interface StatusIndicatorProps {
  status: AIStatus;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusConfig = {
    ready: {
      label: 'AI Ready',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      dotColor: 'bg-emerald-500'
    },
    processing: {
      label: 'Processing',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      dotColor: 'bg-amber-400'
    },
    offline: {
      label: 'Offline',
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/30',
      dotColor: 'bg-gray-400'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
        {status === 'ready' && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.dotColor} animate-ping`} />
        )}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}
