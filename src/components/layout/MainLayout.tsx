import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';
import Navigation from './Navigation';
import GlobalSettingsDialog from '@/components/settings/GlobalSettingsDialog';
import { useWorkspace } from '@/context/WorkspaceContext';
import WorkspaceKnowledgePanel from '@/components/sidebar/WorkspaceKnowledgePanel';

const MainLayout: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const { 
    workspaces, 
    currentWorkspaceId,
    currentThreadId,
    createWorkspace, 
    createThread,
    selectThread 
  } = useWorkspace();
  
  useEffect(() => {
    // If there are no workspaces, create one
    if (workspaces.length === 0) {
      const createDefaultWorkspace = async () => {
        const workspace = await createWorkspace("Default Workspace");
        // After creating the workspace, create a default thread
        if (workspace) {
          const thread = await createThread(workspace.id, "New Thread");
          if (thread) {
            selectThread(workspace.id, thread.id);
          }
        }
      };
      createDefaultWorkspace();
    }
  }, [workspaces, createWorkspace, createThread, selectThread]);
  
  // Ensure we have a valid workspaceId
  const activeWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-mycelial-background via-mycelial-background to-mycelial-background/95">
      <div className="relative w-full h-full">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[10%] left-[15%] w-[30rem] h-[30rem] rounded-full bg-mycelial-tertiary/20 filter blur-[100px]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[20rem] h-[20rem] rounded-full bg-mycelial-secondary/30 filter blur-[80px]"></div>
          <div className="absolute top-[40%] right-[20%] w-[15rem] h-[15rem] rounded-full bg-mycelial-accent/20 filter blur-[60px]"></div>
        </div>
        
        {/* Main content */}
        <div className="relative z-10 h-full w-full flex overflow-hidden">
          <Sidebar onOpenSettings={handleOpenSettings} />
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-mycelial-border">
              <Navigation />
            </div>
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 overflow-hidden">
                {currentWorkspaceId && currentThreadId ? (
                  <ChatInterface />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No active workspace or thread. Please create or select one.</p>
                  </div>
                )}
              </div>
              
              {/* Workspace knowledge panel (right sidebar) */}
              {currentWorkspaceId && (
                <div className="w-64 border-l border-mycelial-border/20 overflow-hidden">
                  <WorkspaceKnowledgePanel workspaceId={currentWorkspaceId} />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Global Settings Dialog */}
        <GlobalSettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      </div>
    </div>
  );
};

export default MainLayout;
