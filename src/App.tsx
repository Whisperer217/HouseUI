import { useState } from 'react';
import Header from './components/Header';
import StatusIndicator from './components/StatusIndicator';
import VoiceButton from './components/VoiceButton';
import QuickCreateBar from './components/QuickCreateBar';
import ProjectGallery from './components/ProjectGallery';
import { FamilyProfile, Project, AIStatus } from './types';

const mockProfiles: FamilyProfile[] = [
  { id: '1', name: 'Dad', avatar: '👨', color: '#3b82f6' },
  { id: '2', name: 'Mom', avatar: '👩', color: '#ec4899' },
  { id: '3', name: 'Emma', avatar: '👧', color: '#8b5cf6' },
  { id: '4', name: 'Lucas', avatar: '👦', color: '#10b981' },
];

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Space Adventure Game',
    type: 'game',
    thumbnail: 'https://images.pexels.com/photos/956999/milky-way-starry-sky-night-sky-star-956999.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Explore the galaxy in this exciting space adventure with alien encounters',
    createdBy: 'Lucas',
    createdAt: '2025-10-10',
    lastModified: '2 days ago',
  },
  {
    id: '2',
    title: 'Recipe Book App',
    type: 'app',
    thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Store and organize all our family recipes in one place',
    createdBy: 'Mom',
    createdAt: '2025-10-08',
    lastModified: '5 days ago',
  },
  {
    id: '3',
    title: 'The Magic Forest',
    type: 'document',
    thumbnail: 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'A collaborative story about a magical forest and its creatures',
    createdBy: 'Emma',
    createdAt: '2025-10-12',
    lastModified: '1 hour ago',
  },
  {
    id: '4',
    title: 'Dragon Portrait',
    type: 'art',
    thumbnail: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Digital painting of a majestic dragon in the mountains',
    createdBy: 'Emma',
    createdAt: '2025-10-11',
    lastModified: 'Yesterday',
  },
  {
    id: '5',
    title: 'Math Quiz Master',
    type: 'game',
    thumbnail: 'https://images.pexels.com/photos/3729557/pexels-photo-3729557.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Fun math challenges to practice addition and multiplication',
    createdBy: 'Lucas',
    createdAt: '2025-10-09',
    lastModified: '3 days ago',
  },
  {
    id: '6',
    title: 'Family Chore Tracker',
    type: 'app',
    thumbnail: 'https://images.pexels.com/photos/4239146/pexels-photo-4239146.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Track weekly chores and earn rewards for completion',
    createdBy: 'Dad',
    createdAt: '2025-10-07',
    lastModified: '1 week ago',
  },
  {
    id: '7',
    title: 'Ocean Sunset',
    type: 'art',
    thumbnail: 'https://images.pexels.com/photos/1118874/pexels-photo-1118874.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Watercolor painting of a peaceful sunset over the ocean',
    createdBy: 'Mom',
    createdAt: '2025-10-13',
    lastModified: '3 hours ago',
  },
  {
    id: '8',
    title: 'Summer Vacation Journal',
    type: 'document',
    thumbnail: 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Our family memories from the beach trip this summer',
    createdBy: 'Dad',
    createdAt: '2025-10-06',
    lastModified: '1 week ago',
  },
];

function App() {
  const [currentProfile, setCurrentProfile] = useState<FamilyProfile>(mockProfiles[0]);
  const [aiStatus] = useState<AIStatus>('ready');
  const [projects] = useState<Project[]>(mockProjects);

  const handleCreateClick = (type: string) => {
    console.log(`Creating new ${type}...`);
  };

  const handleProjectClick = (project: Project) => {
    console.log('Opening project:', project.title);
  };

  return (
    <div className="min-h-screen bg-[#0f1419]">
      <Header
        profiles={mockProfiles}
        currentProfile={currentProfile}
        onProfileChange={setCurrentProfile}
        aiStatus={aiStatus}
      />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 space-y-8 lg:space-y-0">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              Welcome back, {currentProfile.name}!
            </h2>
            <p className="text-gray-400 text-xl">What would you like to create today?</p>
          </div>
          <div className="flex items-center space-x-6">
            <VoiceButton />
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Create</h3>
          <QuickCreateBar onCreateClick={handleCreateClick} />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-6">Your Projects</h3>
          <ProjectGallery
            projects={projects}
            onProjectClick={handleProjectClick}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
