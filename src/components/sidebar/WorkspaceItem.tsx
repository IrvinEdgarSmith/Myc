import React, { useState } from 'react';
import { ChevronRight, ChevronDown, MoreHorizontal, Plus, Settings, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useWorkspace } from '@/context/WorkspaceContext';
import ThreadItem from './ThreadItem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from '../ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import WorkspaceKnowledgePanel from './WorkspaceKnowledgePanel';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';
import WorkspaceSettings from './WorkspaceSettings';
import { Workspace } from '@/types'; 

interface WorkspaceItemProps {
  workspace: Workspace;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ workspace }) => {
  const { 
    currentWorkspaceId, 
    currentThreadId,
    selectThread, 
    toggleWorkspaceExpand, 
    createThread, 
    renameWorkspace,
    deleteWorkspace
  } = useWorkspace();
  
  const { settings: globalSettings } = useGlobalSettings();
  
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState(workspace.name);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  
  const isSelected = currentWorkspaceId === workspace.id;
  
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWorkspaceExpand(workspace.id);
  };
  
  const handleCreateThread = (e: React.MouseEvent) => {
    e.stopPropagation();
    createThread(workspace.id, "New Thread");
  };
  
  const handleSelectThread = (threadId: string) => {
    console.log(`Selecting thread ${threadId} in workspace ${workspace.id}`);
    selectThread(workspace.id, threadId);
  };
  
  const handleRename = () => {
    if (newName.trim()) {
      renameWorkspace(workspace.id, newName);
      setIsRenameDialogOpen(false);
      toast({
        title: "Workspace renamed",
        description: `Workspace renamed to "${newName}"`,
      });
    }
  };
  
  const handleDelete = () => {
    deleteWorkspace(workspace.id);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Workspace deleted",
      description: "The workspace has been deleted",
    });
  };
  
  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSettingsDialogOpen(true);
  };
  
  const handleToggleKnowledgePanel = () => {
    setShowKnowledgePanel(prev => !prev);
  };
  
  // Get the persona gradient if one is selected
  const selectedPersonaId = workspace.settings.selectedPersonaId;
  const selectedPersona = selectedPersonaId 
    ? globalSettings.systemPersonas.find(p => p.id === selectedPersonaId) 
    : undefined;
  
  const getPersonaGradientStyle = () => {
    if (selectedPersona?.gradientFrom && selectedPersona?.gradientTo) {
      return {
        background: `linear-gradient(to right, ${selectedPersona.gradientFrom}, ${selectedPersona.gradientTo})`,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      };
    }
    // Default gradient when no persona is selected (dark blue to dark magenta)
    return {
      background: 'linear-gradient(to right, #1a237e, #880e4f)',
      borderColor: 'rgba(255, 255, 255, 0.1)'
    };
  };
  
  return (
    <div className="mb-2 overflow-hidden">
      <div 
        className={`flex justify-between items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-200 ${
          isSelected 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'hover:bg-sidebar-accent/70'
        }`}
        style={getPersonaGradientStyle()}
        onClick={() => {
          if (workspace.threads.length > 0) {
            handleSelectThread(workspace.threads[0].id);
          }
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <button onClick={handleToggleExpand} className="p-0.5 rounded hover:bg-sidebar-accent/50">
            {workspace.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          <span className="font-medium truncate">{workspace.name}</span>
          
          {selectedPersona && (
            <div 
              className="h-5 w-5 rounded-full flex-shrink-0"
              style={{ 
                background: `linear-gradient(to right, ${selectedPersona.gradientFrom || selectedPersona.iconColor}, ${selectedPersona.gradientTo || selectedPersona.iconColor})`,
                border: `1px solid ${selectedPersona.iconColor}50` 
              }}
            />
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleOpenSettings}
          >
            <Settings size={14} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={handleCreateThread}
          >
            <Plus size={14} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => {
                setNewName(workspace.name);
                setIsRenameDialogOpen(true);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {workspace.isExpanded && (
        <div className="pl-4 mt-1">
          {workspace.threads.map((thread) => (
            <ThreadItem
              key={thread.id}
              thread={thread}
              workspaceId={workspace.id}
              isActive={currentWorkspaceId === workspace.id && currentThreadId === thread.id}
            />
          ))}
          
          {workspace.threads.length === 0 && (
            <div className="py-2 px-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-muted-foreground hover:text-foreground text-sm"
                onClick={() => createThread(workspace.id, "New Thread")}
              >
                <Plus size={14} className="mr-2" />
                Create New Thread
              </Button>
            </div>
          )}
        </div>
      )}
      
      {showKnowledgePanel && (
        <div className="mt-2 pl-4 pr-2 py-2 border-t border-sidebar-border/20">
          <WorkspaceKnowledgePanel workspaceId={workspace.id} />
        </div>
      )}
      
      {/* Settings Dialog */}
      <WorkspaceSettings
        workspaceId={workspace.id}
        open={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
      />
      
      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Workspace</DialogTitle>
            <DialogDescription>
              Enter a new name for this workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workspace? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceItem;
