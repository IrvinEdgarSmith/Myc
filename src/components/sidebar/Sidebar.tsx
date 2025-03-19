import React, { useState } from 'react';
import { Zap, Settings } from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import WorkspaceItem from './WorkspaceItem';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SidebarProps {
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const { 
    workspaces, 
    createWorkspace
  } = useWorkspace();
  
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("New Workspace");
  
  const handleCreateWorkspace = () => {
    createWorkspace(newWorkspaceName.trim() || "New Workspace");
    setIsCreatingWorkspace(false);
    setNewWorkspaceName("New Workspace");
    toast({
      title: "Workspace Created",
      description: "A new workspace has been created"
    });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-mycelial-background to-mycelial-background/95 overflow-hidden min-w-[280px]">
      <div className="flex items-center justify-between p-3 border-b border-mycelial-border/20">
        <h2 className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-mycelial-secondary to-mycelial-tertiary">
          Mycelial Chat
        </h2>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onOpenSettings}
          >
            <Settings size={16} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsCreatingWorkspace(true)}
          >
            <Zap size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="p-4 overflow-y-auto h-full">
          {workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Zap className="h-10 w-10 mb-4 text-mycelial-secondary/70" />
              <h3 className="text-lg font-medium mb-2">Welcome to Mycelial</h3>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Create your first workspace to get started with the AI assistant
              </p>
              <Button
                onClick={() => setIsCreatingWorkspace(true)}
                className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
              >
                Create Workspace
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <WorkspaceItem key={workspace.id} workspace={workspace} />
              ))}
              
              <Button
                variant="outline"
                className="w-full mt-2 border-dashed border-mycelial-border/30 hover:border-mycelial-secondary/50 hover:bg-mycelial-secondary/5"
                onClick={() => setIsCreatingWorkspace(true)}
              >
                <Zap size={16} className="mr-2 text-mycelial-secondary" />
                New Workspace
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isCreatingWorkspace} onOpenChange={setIsCreatingWorkspace}>
        <DialogContent className="sm:max-w-[400px] glassmorphism">
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Workspaces help you organize your conversations with the AI assistant
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input 
                  id="workspace-name" 
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name"
                  className="col-span-3"
                />
              </div>
              
              <div className="flex items-center justify-center">
                <Zap size={32} className="text-mycelial-secondary" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreatingWorkspace(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWorkspace}
              className="bg-mycelial-secondary hover:bg-mycelial-secondary/90"
            >
              Create Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
