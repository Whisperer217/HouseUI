import type { Project, DBProject } from '../types';

export function mapDBProjectToProject(dbProject: DBProject): Project {
  const createdDate = new Date(dbProject.created_at);
  const updatedDate = new Date(dbProject.updated_at);
  const now = new Date();

  const diffMs = now.getTime() - updatedDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let lastModified: string;
  if (diffMins < 60) {
    lastModified = diffMins <= 1 ? '1 minute ago' : `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    lastModified = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    lastModified = 'Yesterday';
  } else if (diffDays < 7) {
    lastModified = `${diffDays} days ago`;
  } else {
    lastModified = createdDate.toLocaleDateString();
  }

  return {
    id: dbProject.id,
    title: dbProject.title,
    type: dbProject.type,
    thumbnail: dbProject.thumbnail_url || getDefaultThumbnail(dbProject.type),
    description: dbProject.description,
    createdBy: dbProject.profiles?.name || 'Unknown',
    createdAt: createdDate.toISOString().split('T')[0],
    lastModified,
  };
}

function getDefaultThumbnail(type: string): string {
  const defaults = {
    game: 'https://images.pexels.com/photos/956999/milky-way-starry-sky-night-sky-star-956999.jpeg?auto=compress&cs=tinysrgb&w=800',
    app: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    story: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=800',
    art: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800',
  };
  return defaults[type as keyof typeof defaults] || defaults.game;
}
