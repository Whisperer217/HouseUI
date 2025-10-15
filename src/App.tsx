import { useState, useEffect } from 'react';
import Header from './components/Header';
import StatusIndicator from './components/StatusIndicator';
import VoiceButton from './components/VoiceButton';
import QuickCreateBar from './components/QuickCreateBar';
import ChatPanel from './components/ChatPanel';
import SearchBar from './components/SearchBar';
import SwipeableGallery from './components/SwipeableGallery';
import ActivityFeed from './components/ActivityFeed';
import TemplatesModal from './components/TemplatesModal';
import ArsenalPanel from './components/ArsenalPanel';
import FullscreenChat from './components/FullscreenChat';
import FloatingChatButton from './components/FloatingChatButton';
import AISettingsModal from './components/AISettingsModal';
import { FamilyProfile, Project, AIStatus } from './types';
import { projectService } from './services/projectService';
import { mapDBProjectToProject } from './utils/projectMapper';
import { Sparkles, Wrench } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showArsenal, setShowArsenal] = useState(false);
  const [showFullscreenChat, setShowFullscreenChat] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);

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

  const handleSelectTemplate = async (template: any) => {
    try {
      setAiStatus('processing');

      const newProject = await projectService.createProject({
        title: template.title,
        description: template.description,
        type: template.type as 'game' | 'app' | 'story' | 'art',
        created_by: currentProfile.id,
      });

      const mappedProject = mapDBProjectToProject(newProject);
      setProjects([mappedProject, ...projects]);
      setAiStatus('ready');
    } catch (error) {
      console.error('Error creating project from template:', error);
      setAiStatus('offline');
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
      <Header
        profiles={familyProfiles}
        currentProfile={currentProfile}
        onProfileChange={setCurrentProfile}
        onAISettings={() => setShowAISettings(true)}
      />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
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

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search projects..."
              />
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                Templates
              </button>
              <button
                onClick={() => setShowArsenal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                <Wrench className="w-5 h-5" />
                Arsenal
              </button>
            </div>

            <div>
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
              ) : filteredProjects.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-lg">
                    {searchQuery
                      ? 'No projects match your search'
                      : 'No projects yet. Click Quick Create or browse Templates!'}
                  </p>
                </div>
              ) : (
                <SwipeableGallery
                  projects={filteredProjects}
                  onProjectClick={handleProjectClick}
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="lg:sticky lg:top-24 space-y-6">
              <ActivityFeed />
              <ChatPanel currentProfile={currentProfile} />
            </div>
          </div>
        </div>
      </main>

      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ArsenalPanel
        isOpen={showArsenal}
        onClose={() => setShowArsenal(false)}
        userId={currentProfile.id}
      />

      <FullscreenChat
        isOpen={showFullscreenChat}
        onClose={() => setShowFullscreenChat(false)}
        currentProfile={currentProfile}
        familyProfiles={familyProfiles}
      />

      {!showFullscreenChat && (
        <FloatingChatButton
          onClick={() => setShowFullscreenChat(true)}
          currentUserId={currentProfile.id}
        />
      )}

      <AISettingsModal
        isOpen={showAISettings}
        onClose={() => setShowAISettings(false)}
      />
    </div>
  );
}

export default App;
