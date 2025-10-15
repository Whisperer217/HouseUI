import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusIndicator from './components/StatusIndicator';
import VoiceButton from './components/VoiceButton';
import QuickCreateBar from './components/QuickCreateBar';
import ProjectGallery from './components/ProjectGallery';
import ChatPanel from './components/ChatPanel';
import { FamilyProfile, Project, AIStatus } from './types';
import { projectService } from './services/projectService';
import { mapDBProjectToProject } from './utils/projectMapper';

const familyProfiles: FamilyProfile[] = [
  { id: '1', name: 'Jacob', avatar: '👨', color: '#3b82f6' },
  { id: '2', name: 'Abby', avatar: '👧', color: '#ec4899' },
  { id: '3', name: 'Ben', avatar: '👦', color: '#10b981' },
  { id: '4', name: 'Rox', avatar: '🐕', color: '#f59e0b' },
];

function App() {
  const [currentProfile, setCurrentProfile] = useState<FamilyProfile>(familyProfiles[0]);
  const [aiStatus, setAiStatus] = useState<AIStatus>('offline');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const dbProjects = await projectService.getAllProjects();
      const mappedProjects = dbProjects.map(mapDBProjectToProject);
      setProjects(mappedProjects);
      setAiStatus('ready');
    } catch (error) {
      console.error('Error loading projects:', error);
      setAiStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = async (type: string) => {
    try {
      setAiStatus('processing');

      const projectTitles = {
        game: 'Untitled Game',
        app: 'Untitled App',
        story: 'Untitled Story',
        art: 'Untitled Art',
      };

      const newProject = await projectService.createProject({
        title: projectTitles[type as keyof typeof projectTitles] || 'New Project',
        description: `A new ${type} project`,
        type: type as 'game' | 'app' | 'story' | 'art',
        created_by: currentProfile.id,
      });

      const mappedProject = mapDBProjectToProject(newProject);
      setProjects([mappedProject, ...projects]);
      setAiStatus('ready');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please make sure the database is set up.');
      setAiStatus('offline');
    }
  };

  const handleProjectClick = (project: Project) => {
    console.log('Opening project:', project.title);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <Header
        profiles={familyProfiles}
        currentProfile={currentProfile}
        onProfileChange={setCurrentProfile}
      />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start justify-between mb-8 gap-8">
          <div className="flex-1 w-full">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8 space-y-6 lg:space-y-0">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  Welcome back, {currentProfile.name}!
                </h2>
                <p className="text-gray-400 text-lg">What would you like to create today?</p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <StatusIndicator status={aiStatus} />
                <VoiceButton />
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Create</h3>
              <QuickCreateBar onCreateClick={handleCreateClick} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Your Projects</h3>
              {loading ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  Loading projects...
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-lg">No projects yet. Click Quick Create to get started!</p>
                </div>
              ) : (
                <ProjectGallery
                  projects={projects}
                  onProjectClick={handleProjectClick}
                />
              )}
            </div>
          </div>

          <div className="w-full lg:w-96 lg:sticky lg:top-24">
            <ChatPanel currentProfile={currentProfile} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
