import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MessageSquare, History, Settings, Sparkles } from 'lucide-react';
import { Project } from '@/types';

interface ProjectHeaderProps {
  project: Project;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowSettings: (show: boolean) => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  activeTab,
  setActiveTab,
  setShowSettings,
}) => {
  const navigate = useNavigate();

  return (
    <div className="border-b border-mycelial-border/30 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/knowledge')}
            className="text-mycelial-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
          </Button>
          <h1 className="text-xl font-bold">{project?.name}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-mycelial-card/50 border border-mycelial-border/20">
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> Chat
              </TabsTrigger>
              <TabsTrigger value="prompt" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" /> Prompt Engineering
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-1">
                <History className="h-4 w-4" /> History
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(true)}
            className="ml-2"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
