import React, { useState } from 'react';
import { MessageSquare, MoreVertical, Edit, Trash } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import { Thread } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { useWorkspace } from '@/context/WorkspaceContext';

interface ThreadItemProps {
  thread: Thread;
  projectId: string;
  isActive: boolean;
  onSelect: (threadId: string) => void;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, projectId, isActive, onSelect }) => {
  const { removeThreadFromProject } = useProject();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(thread.name);
  const { updateProject, projects } = useProject();
  const { workspaces } = useWorkspace();

  const handleSelect = () => {
    onSelect(thread.id);
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewName(thread.name);
    setIsRenaming(true);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (newName.trim()) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const updatedThreads = project.threads.map(t => 
          t.id === thread.id ? { ...t, name: newName.trim() } : t
        );
        
        updateProject(projectId, { threads: updatedThreads });
        toast({
          title: "Thread renamed",
          description: `Thread has been renamed to ${newName}`
        });
      }
    }
    setIsRenaming(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeThreadFromProject(projectId, thread.id);
    toast({
      title: "Thread deleted",
      description: "Thread has been removed from the project"
    });
  };

  // Format the thread's creation date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(thread.createdAt));

  // Get the last message content safely
  const getLastMessageContent = () => {
    if (thread.messages.length > 0) {
      const lastMessage = thread.messages[thread.messages.length - 1];
      return lastMessage?.content ? lastMessage.content.substring(0, 40) + "..." : "No content";
    }
    return "No messages";
  };

  return (
    <div
      onClick={handleSelect}
      className={`flex items-center justify-between p-2 rounded ${
        isActive 
          ? 'bg-mycelial-secondary/20 border-l-2 border-mycelial-secondary' 
          : 'hover:bg-mycelial-card/80'
      } cursor-pointer group mb-1`}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <MessageSquare size={16} className={isActive ? "text-mycelial-secondary" : ""} />
        
        {isRenaming ? (
          <form onSubmit={handleRename} className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onBlur={handleRename}
              className="h-6 py-0 px-1 text-sm"
            />
          </form>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium">{thread.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {getLastMessageContent()}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <span className="text-xs text-muted-foreground mr-2">{formattedDate}</span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleStartRename}>
              <Edit size={14} className="mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
              <Trash size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ThreadItem;
