import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProjectCard from '@/components/knowledge/ProjectCard';
import ProjectForm from '@/components/knowledge/ProjectForm';
import { ArrowLeft, Settings } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import PromptLibrary from '@/components/knowledge/PromptLibrary';
import KnowledgeItemsList from '@/components/knowledge/items/KnowledgeItemsList';
import KnowledgeFoldersList from '@/components/knowledge/KnowledgeFoldersList';
import KnowledgeCenterSettings from '@/components/knowledge/settings/KnowledgeCenterSettings';
import { useKnowledge } from '@/context/KnowledgeContext';

const KnowledgeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { projects } = useProject();
  const { knowledgeItems } = useKnowledge();
  const navigate = useNavigate();
  
  // Handle route-based tab selection
  useEffect(() => {
    if (window.location.pathname.includes('knowledge')) {
      setActiveTab('knowledge-items');
    }
  }, []);
  
  console.log("KnowledgeDashboard rendering, active tab:", activeTab);
  console.log("Knowledge items count:", knowledgeItems.length);
  
  // Sort projects by most recently updated
  const sortedProjects = [...projects].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="h-screen bg-gradient-to-br from-mycelial-background to-mycelial-background/95 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-mycelial-accent"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Chat
            </Button>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mycelial-secondary to-mycelial-tertiary">
              Knowledge Center
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="mr-4"
            >
              <Settings className="h-4 w-4 mr-1" /> Knowledge Center Settings
            </Button>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-mycelial-card/50 border border-mycelial-border/20">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="knowledge-folders">Knowledge Folders</TabsTrigger>
                <TabsTrigger value="prompts">Prompt Library</TabsTrigger>
                <TabsTrigger value="knowledge-items">Knowledge Items</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="projects">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Projects</h2>
              <Button 
                onClick={() => setIsCreateProjectOpen(true)}
                className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
              >
                Create Project
              </Button>
            </div>
            
            {sortedProjects.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-mycelial-border/50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first project to start organizing your AI conversations and knowledge.
                </p>
                <Button 
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
                >
                  Create Your First Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProjects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="knowledge-folders">
            <KnowledgeFoldersList />
          </TabsContent>
          
          <TabsContent value="prompts">
            <h2 className="text-xl font-semibold mb-6">Prompt Library</h2>
            <PromptLibrary />
          </TabsContent>
          
          <TabsContent value="knowledge-items">
            <h2 className="text-xl font-semibold mb-6">Knowledge Items</h2>
            <KnowledgeItemsList />
          </TabsContent>
        </Tabs>
      </div>
      
      {isCreateProjectOpen && (
        <ProjectForm 
          isOpen={isCreateProjectOpen} 
          onOpenChange={setIsCreateProjectOpen} 
        />
      )}
      
      <KnowledgeCenterSettings 
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default KnowledgeDashboard;
