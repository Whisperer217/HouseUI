export type ProjectType = 'game' | 'app' | 'document' | 'art';

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
