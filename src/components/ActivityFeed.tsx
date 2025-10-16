import { useState, useEffect } from 'react';
import { Clock, Zap, Star, Users } from 'lucide-react';

interface Activity {
  id: string;
  user_name: string;
  action: string;
  project_title: string;
  timestamp: string;
  avatar_color: string;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = () => {
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const mapped: Activity[] = projects.slice(0, 10).map((project: any) => ({
          id: project.id,
          user_name: project.creator?.name || 'Unknown',
          action: new Date(project.updatedAt).getTime() - new Date(project.createdAt).getTime() < 5000
            ? 'created'
            : 'updated',
          project_title: project.title,
          timestamp: project.updatedAt,
          avatar_color: getColorForName(project.creator?.name || 'Unknown'),
        }));
        setActivities(mapped);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const getColorForName = (name: string): string => {
    const colors: { [key: string]: string } = {
      'Jacob': '#3b82f6',
      'Abby': '#ec4899',
      'Ben': '#10b981',
      'Rox': '#f59e0b',
    };
    return colors[name] || '#6b7280';
  };

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Recent Activity
        </h3>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live
        </span>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
                style={{ backgroundColor: activity.avatar_color }}
              >
                {activity.user_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300">
                  <span className="font-semibold text-white">{activity.user_name}</span>
                  {' '}
                  <span className="text-gray-400">
                    {activity.action === 'created' ? 'created' : 'updated'}
                  </span>
                  {' '}
                  <span className="text-blue-400 truncate inline-block max-w-[150px] align-bottom">
                    {activity.project_title}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {getRelativeTime(activity.timestamp)}
                </p>
              </div>
              {activity.action === 'created' && (
                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span>Family online</span>
          </div>
          <div className="flex -space-x-2">
            {['Jacob', 'Abby', 'Ben', 'Rox'].map((name) => (
              <div
                key={name}
                className="w-6 h-6 rounded-full border-2 border-gray-800 flex items-center justify-center text-white text-xs font-semibold"
                style={{ backgroundColor: getColorForName(name) }}
                title={name}
              >
                {name[0]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
