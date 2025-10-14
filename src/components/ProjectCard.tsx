import { Clock, User } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const typeColors = {
    game: 'from-violet-500/20 to-purple-600/20 border-violet-500/30',
    app: 'from-blue-500/20 to-cyan-600/20 border-blue-500/30',
    document: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30',
    art: 'from-pink-500/20 to-rose-600/20 border-pink-500/30',
  };

  const typeBadgeColors = {
    game: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    app: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    document: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    art: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  };

  return (
    <button
      onClick={() => onClick(project)}
      className="group relative bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border border-gray-700 hover:border-gray-600"
    >
      <div className={`aspect-video bg-gradient-to-br ${typeColors[project.type]} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${typeBadgeColors[project.type]} backdrop-blur-sm`}>
            {project.type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2 text-left group-hover:text-amber-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm mb-3 text-left line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <User className="w-3 h-3" />
            <span>{project.createdBy}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{project.lastModified}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
