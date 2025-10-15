export type ProjectType = 'game' | 'app' | 'story' | 'art';

export type AIStatus = 'ready' | 'processing' | 'offline';

export interface FamilyProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface Project {
  id: string;
  title: string;
  type: ProjectType;
  thumbnail: string;
  description: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

export interface DBProject {
  id: string;
  title: string;
  type: ProjectType;
  description: string;
  thumbnail_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}
