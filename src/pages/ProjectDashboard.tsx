import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/context/ProjectContext';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useKnowledge } from '@/context/KnowledgeContext';
import ProjectSettings from '@/components/project/ProjectSettings';
import AddKnowledgeDialog from '@/components/project/AddKnowledgeDialog';

// Import our new components
import ProjectHeader from '@/components/project/ProjectHeader';
import LeftSidebar from '@/components/project/LeftSidebar';
import RightSidebar from '@/components/project/RightSidebar';
import TabContent from '@/components/project/TabContent';

const ProjectDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, selectProject, updateProject } = useProject();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showAddKnowledgeDialog, setShowAddKnowledgeDialog] = useState(false);
  const [activePromptCategory, setActivePromptCategory] = useState<string | null>(null);
  const [expandedIterations, setExpandedIterations] = useState<string[]>([]);
  const [selectedIteration, setSelectedIteration] = useState<string | null>(null);
  
  const project = projects.find(p => p.id === id);
  
  useEffect(() => {
    if (id) {
      selectProject(id);
      console.log("Selected project with ID:", id);
    }
  }, [id, selectProject]);

  useEffect(() => {
    if (project?.threads?.length && !activeThreadId) {
      setActiveThreadId(project.threads[0].id);
    }
  }, [project, activeThreadId]);
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-mycelial-background to-mycelial-background/95">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <p className="mb-6">The project you're looking for doesn't exist or has been deleted.</p>
          <Button 
            onClick={() => navigate('/knowledge')}
            className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
          >
            Go Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setActiveTab('chat');
  };

  const { knowledgeItems, folders } = useKnowledge();

  const getLinkedKnowledgeEntities = () => {
    if (!project) return { items: [], folders: [] };
    
    const linkedItems = knowledgeItems.filter(item => 
      project.linkedKnowledge.includes(item.id)
    );
    
    const linkedFolders = folders.filter(folder => 
      project.linkedKnowledge.includes(folder.id)
    );
    
    return { items: linkedItems, folders: linkedFolders };
  };

  const linkedEntities = getLinkedKnowledgeEntities();

  const handleToggleIncludeInContext = (id: string) => {
    if (project) {
      const updatedIncludeList = project.knowledgeInContext?.includes(id)
        ? project.knowledgeInContext.filter(itemId => itemId !== id)
        : [...(project.knowledgeInContext || []), id];
      
      if (id) {
        updateProject(project.id, { knowledgeInContext: updatedIncludeList });
      }
    }
  };

  const toggleIterationExpanded = (id: string) => {
    if (expandedIterations.includes(id)) {
      setExpandedIterations(expandedIterations.filter(itemId => itemId !== id));
    } else {
      setExpandedIterations([...expandedIterations, id]);
    }
  };

  const promptCategories = [
    { id: 'persona', title: 'Persona Declaration', type: 'system' },
    { id: 'context', title: 'Contextual Briefing', type: 'system' },
    { id: 'formatting', title: 'Response Formatting', type: 'system' },
    { id: 'constraints', title: 'Output Constraints', type: 'system' },
    { id: 'ethics', title: 'Ethical Directives', type: 'system' },
    { id: 'data-source', title: 'Data Source Integration', type: 'system' },
    { id: 'task', title: 'Task Specification', type: 'user' },
    { id: 'goal', title: 'Goal Declaration', type: 'user' },
    { id: 'tone', title: 'Tone/Style Preferences', type: 'user' },
    { id: 'instructions', title: 'Detailed Instructions', type: 'user' },
    { id: 'followup', title: 'Clarification & Follow-Up', type: 'user' },
    { id: 'customization', title: 'Customization Parameters', type: 'user' },
  ];

  const handleSelectPromptCategory = (categoryId: string) => {
    setActivePromptCategory(categoryId);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-mycelial-background to-mycelial-background/95 flex flex-col">
      <ProjectHeader 
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowSettings={setShowSettings}
      />
      
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-mycelial-card/50 border-r border-mycelial-border/30 min-h-0">
              <LeftSidebar 
                activeTab={activeTab}
                project={project}
                activeThreadId={activeThreadId}
                handleSelectThread={handleSelectThread}
                promptCategories={promptCategories}
                activePromptCategory={activePromptCategory}
                handleSelectPromptCategory={handleSelectPromptCategory}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={60} className="min-h-0">
              <TabContent 
                activeTab={activeTab}
                project={project}
                activeThreadId={activeThreadId}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-mycelial-card/50 border-l border-mycelial-border/30 min-h-0">
              <RightSidebar 
                activeTab={activeTab}
                project={project}
                linkedItems={linkedEntities.items}
                linkedFolders={linkedEntities.folders}
                expandedIterations={expandedIterations}
                selectedIteration={selectedIteration}
                toggleIterationExpanded={toggleIterationExpanded}
                setShowAddKnowledgeDialog={setShowAddKnowledgeDialog}
                handleToggleIncludeInContext={handleToggleIncludeInContext}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </Tabs>
      </div>
      
      {showSettings && <ProjectSettings projectId={project?.id} open={showSettings} onOpenChange={setShowSettings} />}
      
      <AddKnowledgeDialog 
        open={showAddKnowledgeDialog} 
        onOpenChange={setShowAddKnowledgeDialog}
        projectId={project?.id}
      />
    </div>
  );
};

export default ProjectDashboard;
