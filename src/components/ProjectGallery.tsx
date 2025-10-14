import { useState } from 'react';
import { Project, ProjectType } from '../types';
import ProjectCard from './ProjectCard';
import { Filter } from 'lucide-react';

interface ProjectGalleryProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

export default function ProjectGallery({ projects, onProjectClick }: ProjectGalleryProps) {
  const [filter, setFilter] = useState<ProjectType | 'all'>('all');

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.type === filter);

  const filters: { value: ProjectType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'game', label: 'Games' },
    { value: 'app', label: 'Apps' },
    { value: 'document', label: 'Documents' },
    { value: 'art', label: 'Art' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex space-x-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === f.value
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-gray-400 text-sm">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        </span>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No projects yet. Create your first one above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={onProjectClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
