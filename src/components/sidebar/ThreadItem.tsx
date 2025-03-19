import React, { useState } from 'react';
import { MessageCircle, Edit, Trash, MoreVertical } from 'lucide-react';
import { Thread } from '@/types';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface ThreadItemProps {
  thread: Thread;
  workspaceId: string;
  isActive: boolean;
}

const ThreadItem: React.FC<ThreadItemProps> = ({ thread, workspaceId, isActive }) => {
  const { selectThread, renameThread, deleteThread, workspaces, currentThreadId } = useWorkspace();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(thread.name);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isRenaming) {
      selectThread(workspaceId, thread.id);
    }
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      renameThread(workspaceId, thread.id, newName);
      toast({
        title: "Thread renamed",
        description: `Thread renamed to "${newName}"`
      });
    }
    setIsRenaming(false);
  };

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNewName(thread.name);
    setIsRenaming(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThread(workspaceId, thread.id);
    toast({
      title: "Thread deleted",
      description: "Thread has been deleted"
    });
  };

  // Find current workspace to check knowledge context information
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);
  const knowledgeInContextCount = currentWorkspace?.knowledgeInContext?.length || 0;

  return (
    <div
      className={cn(
        "ml-2 rounded-md py-2 px-3 flex items-center justify-between group",
        isActive ? "bg-mycelial-secondary/20 border-l-2 border-mycelial-secondary" : "hover:bg-mycelial-card/40",
        isRenaming ? "pointer-events-none" : "cursor-pointer"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <MessageCircle
          size={14}
          className={cn(
            "shrink-0",
            isActive ? "text-mycelial-secondary" : "text-muted-foreground"
          )}
        />
        
        {isRenaming ? (
          <form onSubmit={handleRename} onClick={(e) => e.stopPropagation()} className="flex-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onBlur={handleRename}
              className="h-6 py-0 px-1 text-xs"
            />
          </form>
        ) : (
          <div className="text-sm truncate">
            {thread.name}
            {isActive && knowledgeInContextCount > 0 && (
              <span className="ml-2 text-xs bg-mycelial-secondary/20 px-1.5 py-0.5 rounded-full">
                KB {knowledgeInContextCount}
              </span>
            )}
          </div>
        )}
      </div>
      
      {!isRenaming && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 glassmorphism border-mycelial-border/30">
            <DropdownMenuItem onClick={handleStartRename} className="text-xs focus:bg-mycelial-secondary/20">
              <Edit size={12} className="mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash size={12} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default ThreadItem;
