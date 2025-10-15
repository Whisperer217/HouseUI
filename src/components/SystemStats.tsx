import { useState, useEffect } from 'react';
import { Cpu, HardDrive, Activity } from 'lucide-react';

export default function SystemStats() {
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    storage: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      setStats({
        cpu: Math.floor(Math.random() * 40) + 20,
        memory: Math.floor(Math.random() * 30) + 40,
        storage: Math.floor(Math.random() * 20) + 60,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value < 50) return 'text-green-400';
    if (value < 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-gray-400">CPU:</span>
        <span className={`text-xs font-semibold ${getStatusColor(stats.cpu)}`}>
          {stats.cpu}%
        </span>
      </div>

      <div className="w-px h-4 bg-gray-700" />

      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-purple-400" />
        <span className="text-xs text-gray-400">RAM:</span>
        <span className={`text-xs font-semibold ${getStatusColor(stats.memory)}`}>
          {stats.memory}%
        </span>
      </div>

      <div className="w-px h-4 bg-gray-700" />

      <div className="flex items-center gap-2">
        <HardDrive className="w-4 h-4 text-green-400" />
        <span className="text-xs text-gray-400">Disk:</span>
        <span className={`text-xs font-semibold ${getStatusColor(stats.storage)}`}>
          {stats.storage}%
        </span>
      </div>
    </div>
  );
}
